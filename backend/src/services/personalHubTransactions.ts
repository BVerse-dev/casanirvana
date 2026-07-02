import { adminSupabase } from '../lib/supabase';
import { getExpressPayPaymentRecord, initiateExpressPayPayment } from './expresspay';
import {
  ExpressPayCatalogProvider,
  PersonalHubBillCategory,
  PersonalHubServiceCategory,
  resolveExpressPayCatalogProvider,
} from './expresspayBillPay';
import { reconcilePersonalHubPaymentFulfillment } from './personalHubFulfillment';

type JsonRecord = Record<string, unknown>;

export type PersonalHubInitiateInput = {
  actorUserId: string;
  profileId: string | null;
  unitId: string;
  communityId: string | null;
  payerProfile?: {
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  transactionType: PersonalHubServiceCategory;
  paymentMethod: string;
  amount: number;
  currencyCode?: string | null;
  description?: string | null;
  providerId?: string | null;
  externalServiceCode?: string | null;
  billCategory?: PersonalHubBillCategory | null;
  queryContext?: JsonRecord;
  recipient?: JsonRecord;
  selectedOption?: JsonRecord;
  metadata?: JsonRecord;
  idempotencyKey?: string | null;
};

type SourceTransactionRecord = {
  id: string;
};

const asObject = (value: unknown): JsonRecord =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonRecord) : {};

const pickString = (source: JsonRecord, keys: string[]) => {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
};

const pickNumber = (source: JsonRecord, keys: string[]) => {
  for (const key of keys) {
    const raw = source[key];
    const parsed = typeof raw === 'number' ? raw : Number(raw);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
};

const normalizeTransactionStatus = (value: unknown) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return 'pending';
  if (normalized === 'initiated' || normalized === 'processing') return 'pending';
  return normalized;
};

const SOURCE_TYPE_BY_TRANSACTION: Record<PersonalHubServiceCategory, string> = {
  airtime: 'airtime_purchase',
  data: 'data_purchase',
  money_transfer: 'money_transfer',
  bill_payment: 'bill_payment',
  insurance: 'insurance_payment',
};

const normalizeAmount = (value: number) => {
  const normalized = Number(value);
  if (!Number.isFinite(normalized) || normalized <= 0) {
    throw new Error('A valid amount is required for Personal Hub checkout.');
  }
  return normalized;
};

const buildSourceDescription = ({
  transactionType,
  provider,
  description,
  recipient,
  queryContext,
}: {
  transactionType: PersonalHubServiceCategory;
  provider: ExpressPayCatalogProvider;
  description?: string | null;
  recipient: JsonRecord;
  queryContext: JsonRecord;
}) => {
  if (description) {
    return description;
  }

  if (transactionType === 'airtime' || transactionType === 'data') {
    return pickString(queryContext, ['customer_name']) || pickString(recipient, ['phone_number', 'phone']) || provider.provider_name;
  }

  if (transactionType === 'bill_payment') {
    return pickString(queryContext, ['customer_name']) || provider.provider_name;
  }

  if (transactionType === 'insurance') {
    return pickString(queryContext, ['customer_name']) || provider.provider_name;
  }

  if (transactionType === 'money_transfer') {
    return pickString(recipient, ['name', 'recipient_name']) || provider.provider_name;
  }

  return provider.provider_name;
};

const createSourceTransactionRow = async ({
  input,
  provider,
}: {
  input: PersonalHubInitiateInput;
  provider: ExpressPayCatalogProvider;
}): Promise<{ table: string; record: SourceTransactionRecord }> => {
  const amount = normalizeAmount(input.amount);
  const description = buildSourceDescription({
    transactionType: input.transactionType,
    provider,
    description: input.description,
    recipient: asObject(input.recipient),
    queryContext: asObject(input.queryContext),
  });
  const recipient = asObject(input.recipient);
  const queryContext = asObject(input.queryContext);
  const selectedOption = asObject(input.selectedOption);
  const metadata = asObject(input.metadata);

  switch (input.transactionType) {
    case 'airtime': {
      const { data, error } = await adminSupabase
        .from('airtime_purchases')
        .insert({
          user_id: input.actorUserId,
          profile_id: input.profileId,
          provider: provider.external_service_code,
          provider_id: provider.id,
          provider_display_name: provider.provider_name,
          external_service_code: provider.external_service_code,
          phone_number:
            pickString(recipient, ['phone_number', 'phone', 'recipient_phone']) ||
            pickString(queryContext, ['phone_number']) ||
            '',
          description,
          amount,
          status: 'pending',
          query_context: queryContext,
          provider_payload: metadata,
          fulfillment_status: 'pending',
        })
        .select('id')
        .single();

      if (error) {
        throw new Error(`Failed to create airtime purchase: ${error.message}`);
      }

      return { table: 'airtime_purchases', record: data as SourceTransactionRecord };
    }

    case 'data': {
      const { data, error } = await adminSupabase
        .from('data_purchases')
        .insert({
          user_id: input.actorUserId,
          profile_id: input.profileId,
          provider: provider.external_service_code,
          provider_id: provider.id,
          provider_display_name: provider.provider_name,
          external_service_code: provider.external_service_code,
          phone_number:
            pickString(recipient, ['phone_number', 'phone', 'recipient_phone']) ||
            pickString(queryContext, ['phone_number']) ||
            '',
          description,
          package_name:
            pickString(selectedOption, ['name', 'package_name']) ||
            pickString(queryContext, ['package_name']) ||
            'Data Bundle',
          data_amount:
            pickString(selectedOption, ['data_amount', 'bundle_size']) ||
            pickString(queryContext, ['data_amount']) ||
            '',
          validity_days:
            pickNumber(selectedOption, ['validity_days', 'validity']) ||
            pickNumber(queryContext, ['validity_days']) ||
            null,
          amount,
          status: 'pending',
          query_context: queryContext,
          provider_payload: {
            ...metadata,
            selected_option: selectedOption,
          },
          fulfillment_status: 'pending',
        })
        .select('id')
        .single();

      if (error) {
        throw new Error(`Failed to create data purchase: ${error.message}`);
      }

      return { table: 'data_purchases', record: data as SourceTransactionRecord };
    }

    case 'money_transfer': {
      const fee = pickNumber(metadata, ['fee', 'platform_fee']) || 0;
      const totalAmount = pickNumber(metadata, ['total_amount']) || amount + fee;
      const { data, error } = await adminSupabase
        .from('money_transfers')
        .insert({
          user_id: input.actorUserId,
          profile_id: input.profileId,
          provider_id: provider.id,
          provider_code: provider.external_service_code,
          provider_display_name: provider.provider_name,
          external_service_code: provider.external_service_code,
          recipient_name: pickString(recipient, ['name', 'recipient_name']) || description,
          recipient_phone: pickString(recipient, ['phone_number', 'phone', 'recipient_phone']) || '',
          recipient_bank: pickString(recipient, ['bank_name', 'recipient_bank']),
          recipient_account: pickString(recipient, ['account_number', 'recipient_account']),
          amount,
          fee,
          total_amount: totalAmount,
          status: 'pending',
          query_context: queryContext,
          provider_payload: metadata,
          fulfillment_status: 'pending',
        })
        .select('id')
        .single();

      if (error) {
        throw new Error(`Failed to create money transfer: ${error.message}`);
      }

      return { table: 'money_transfers', record: data as SourceTransactionRecord };
    }

    case 'bill_payment': {
      const fee = pickNumber(metadata, ['fee', 'platform_fee']) || 0;
      const totalAmount = pickNumber(metadata, ['total_amount']) || amount + fee;
      const { data, error } = await adminSupabase
        .from('bill_payments')
        .insert({
          user_id: input.actorUserId,
          profile_id: input.profileId,
          bill_type: provider.bill_category,
          provider: provider.external_service_code,
          provider_id: provider.id,
          provider_display_name: provider.provider_name,
          external_service_code: provider.external_service_code,
          account_number:
            pickString(recipient, ['account_number', 'meter_number', 'smartcard_number']) ||
            pickString(queryContext, ['account_number']) ||
            '',
          customer_name: pickString(queryContext, ['customer_name']) || description,
          amount,
          fee,
          total_amount: totalAmount,
          status: 'pending',
          verification_status: pickString(queryContext, ['verification_status']) || 'verified',
          query_context: queryContext,
          provider_payload: {
            ...metadata,
            selected_option: selectedOption,
          },
          fulfillment_status: 'pending',
        })
        .select('id')
        .single();

      if (error) {
        throw new Error(`Failed to create bill payment: ${error.message}`);
      }

      return { table: 'bill_payments', record: data as SourceTransactionRecord };
    }

    case 'insurance': {
      const fee = pickNumber(metadata, ['fee', 'platform_fee']) || 0;
      const totalAmount = pickNumber(metadata, ['total_amount']) || amount + fee;
      const { data, error } = await adminSupabase
        .from('insurance_payments')
        .insert({
          user_id: input.actorUserId,
          profile_id: input.profileId,
          insurance_type: pickString(queryContext, ['insurance_type']) || provider.provider_name,
          provider: provider.external_service_code,
          provider_id: provider.id,
          provider_display_name: provider.provider_name,
          external_service_code: provider.external_service_code,
          policy_number:
            pickString(recipient, ['policy_number', 'member_number']) ||
            pickString(queryContext, ['policy_number']) ||
            '',
          insured_name: pickString(queryContext, ['customer_name']) || description,
          coverage_period:
            pickString(queryContext, ['coverage_period']) ||
            pickString(selectedOption, ['coverage_period']) ||
            null,
          amount,
          fee,
          total_amount: totalAmount,
          status: 'pending',
          query_context: queryContext,
          provider_payload: {
            ...metadata,
            selected_option: selectedOption,
          },
          fulfillment_status: 'pending',
        })
        .select('id')
        .single();

      if (error) {
        throw new Error(`Failed to create insurance payment: ${error.message}`);
      }

      return { table: 'insurance_payments', record: data as SourceTransactionRecord };
    }
  }
};

const markSourceTransactionFailed = async ({
  table,
  id,
  message,
}: {
  table: string;
  id: string;
  message: string;
}) => {
  const updates: Record<string, unknown> = {
    status: 'failed',
    provider_payload: {
      initiation_error: message,
    },
    updated_at: new Date().toISOString(),
  };

  if (table !== 'airtime_purchases' && table !== 'data_purchases' && table !== 'shopping_payments') {
    updates.error_message = message;
  }

  await adminSupabase.from(table).update(updates).eq('id', id);
};

export const initiatePersonalHubTransaction = async (input: PersonalHubInitiateInput) => {
  const provider = await resolveExpressPayCatalogProvider({
    providerId: input.providerId,
    externalServiceCode: input.externalServiceCode,
    serviceType: input.transactionType,
    billCategory: input.billCategory || null,
  });

  if (!provider.supports_pay) {
    throw new Error(`${provider.provider_name} is not enabled for checkout.`);
  }

  const { table, record } = await createSourceTransactionRow({
    input,
    provider,
  });

  try {
    const gatewayPayment = await initiateExpressPayPayment({
      amount: input.amount,
      currency: input.currencyCode || 'GHS',
      paymentType: input.transactionType,
      paymentMethod: input.paymentMethod,
      unitId: input.unitId,
      payerId: input.actorUserId,
      payerProfile: input.payerProfile,
      description: input.description || provider.provider_name,
      sourceType: SOURCE_TYPE_BY_TRANSACTION[input.transactionType],
      sourceId: record.id,
      communityId: input.communityId,
      metadata: {
        source: 'personal-hub-transaction-api',
        provider_id: provider.id,
        provider_name: provider.provider_name,
        external_service_code: provider.external_service_code,
        bill_category: provider.bill_category,
        query_context: asObject(input.queryContext),
        selected_option: asObject(input.selectedOption),
        personal_hub_transaction_type: input.transactionType,
        ...(input.metadata || {}),
      },
      idempotencyKey: input.idempotencyKey || null,
    });

    const { error: updateError } = await adminSupabase
      .from(table)
      .update({
        payment_ref_id: gatewayPayment.paymentId,
        provider_payload: {
          ...(input.metadata || {}),
          selected_option: asObject(input.selectedOption),
          payment_id: gatewayPayment.paymentId,
          transaction_id: gatewayPayment.transactionId,
          provider_reference: gatewayPayment.providerReference,
          token: gatewayPayment.token,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', record.id);

    if (updateError) {
      throw new Error(`Failed to update ${table} with payment reference: ${updateError.message}`);
    }

    return {
      provider,
      source_type: SOURCE_TYPE_BY_TRANSACTION[input.transactionType],
      source_id: record.id,
      payment: gatewayPayment,
    };
  } catch (error) {
    await markSourceTransactionFailed({
      table,
      id: record.id,
      message: error instanceof Error ? error.message : 'Payment initiation failed',
    });
    throw error;
  }
};

export const getPersonalHubTransactionStatus = async ({
  transactionId,
  actorUserId,
  isAdmin,
}: {
  transactionId: string;
  actorUserId: string;
  isAdmin: boolean;
}) => {
  let query = adminSupabase
    .from('personal_hub_transactions')
    .select('*')
    .eq('transaction_id', transactionId)
    .limit(1);

  if (!isAdmin) {
    query = query.eq('user_id', actorUserId);
  }

  const { data: initialTransaction, error } = await query.maybeSingle();

  if (error) {
    throw new Error(`Failed to load Personal Hub transaction: ${error.message}`);
  }

  if (!initialTransaction) {
    return null;
  }

  let transaction = initialTransaction;
  let payment = transaction.payment_id ? await getExpressPayPaymentRecord(transaction.payment_id) : null;

  if (payment?.id && normalizeTransactionStatus(payment.status) === 'completed') {
    await reconcilePersonalHubPaymentFulfillment({
      paymentId: payment.id,
      paymentStatus: payment.status,
    });

    const { data: refreshedData, error: refreshError } = await query.maybeSingle();
    if (refreshError) {
      throw new Error(`Failed to refresh Personal Hub transaction: ${refreshError.message}`);
    }

    if (refreshedData) {
      transaction = refreshedData;
    }

    payment = transaction.payment_id ? await getExpressPayPaymentRecord(transaction.payment_id) : payment;
  }

  return {
    transaction,
    payment,
  };
};
