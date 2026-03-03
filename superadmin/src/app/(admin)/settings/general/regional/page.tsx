'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  CardTitle, 
  Button, 
  Row, 
  Col, 
  Form,
  Alert 
} from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import useRegionalLocalizationSettings, { RegionalLocalizationSettings } from '@/hooks/useRegionalLocalizationSettings';

// Validation schema
const regionalSchema = yup.object({
  timezone: yup.string().required('Timezone is required'),
  dateFormat: yup.string().required('Date format is required'),
  timeFormat: yup.string().required('Time format is required'),
  weekStartDay: yup.string().required('Week start day is required'),
  currency: yup.string().required('Currency is required'),
  currencyPosition: yup.string().required('Currency position is required'),
  numberFormat: yup.string().required('Number format is required'),
  primaryLanguage: yup.string().required('Primary language is required'),
  supportedLanguages: yup.array().of(yup.string().required()).min(1, 'At least one language must be supported').default([]),
  rtlSupport: yup.boolean().default(false),
  addressFormat: yup.string().required('Address format is required'),
  phoneFormat: yup.string().required('Phone format is required'),
  postalCodeFormat: yup.string().required('Postal code format is required'),
  gstEnabled: yup.boolean().default(false),
  vatEnabled: yup.boolean().default(false),
  gdprCompliance: yup.boolean().default(false),
  cookieConsent: yup.boolean().default(false),
  dataLocalization: yup.boolean().default(false),
});

type RegionalFormData = RegionalLocalizationSettings;

// Sample data for dropdowns
const timezones = [
  { value: 'Africa/Accra', label: 'Africa/Accra (UTC+00:00)' },
  { value: 'Europe/London', label: 'Europe/London (UTC+00:00)' },
  { value: 'America/New_York', label: 'America/New_York (UTC-05:00)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (UTC+04:00)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (UTC+08:00)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (UTC+11:00)' },
];

const dateFormats = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2024)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2024)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-31)' },
  { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY (31-12-2024)' },
];

const languages = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'ar', label: 'Arabic' },
  { value: 'es', label: 'Spanish' },
];

const currencies = [
  { value: 'GHS', label: 'Ghana Cedi (GH₵)' },
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'AED', label: 'UAE Dirham (د.إ)' },
];

export default function RegionalLocalizationPage() {
  const [showAlert, setShowAlert] = useState<{ type: string; message: string } | null>(null);
  
  // Use regional localization settings hook
  const {
    regionalSettings,
    isLoadingData,
    isUpdating,
    updateSettings,
    loadError,
    updateError,
    updateSuccess,
  } = useRegionalLocalizationSettings();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegionalFormData>({
    resolver: yupResolver(regionalSchema),
    defaultValues: {
      timezone: 'Africa/Accra',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12',
      weekStartDay: 'monday',
      currency: 'GHS',
      currencyPosition: 'before',
      numberFormat: 'standard',
      primaryLanguage: 'en',
      supportedLanguages: ['en'],
      rtlSupport: false,
      addressFormat: 'ghana',
      phoneFormat: 'ghana',
      postalCodeFormat: 'ghana',
      gstEnabled: false,
      vatEnabled: true,
      gdprCompliance: true,
      cookieConsent: true,
      dataLocalization: false,
    },
  });

  // Reset form with real data when it loads
  useEffect(() => {
    if (regionalSettings) {
      reset(regionalSettings);
    }
  }, [regionalSettings, reset]);

  // Handle success/error alerts
  useEffect(() => {
    if (updateSuccess) {
      setShowAlert({ type: 'success', message: 'Regional & localization settings updated successfully!' });
    }
  }, [updateSuccess]);

  useEffect(() => {
    if (updateError) {
      setShowAlert({ type: 'danger', message: 'Failed to update regional settings. Please try again.' });
    }
  }, [updateError]);

  useEffect(() => {
    if (loadError) {
      setShowAlert({ type: 'warning', message: 'Failed to load some settings. Using default values.' });
    }
  }, [loadError]);

  const watchedLanguages = watch('supportedLanguages');
  const watchedCurrency = watch('currency');
  const watchedTimezone = watch('timezone');
  const watchedGstEnabled = watch('gstEnabled');
  const watchedVatEnabled = watch('vatEnabled');
  const watchedGdprCompliance = watch('gdprCompliance');
  const watchedCookieConsent = watch('cookieConsent');
  const watchedDataLocalization = watch('dataLocalization');
  const complianceEnabledCount = [
    watchedGstEnabled,
    watchedVatEnabled,
    watchedGdprCompliance,
    watchedCookieConsent,
    watchedDataLocalization,
  ].filter(Boolean).length;

  const onSubmit = async (data: RegionalFormData) => {
    try {
      // Hide any existing alerts
      setShowAlert(null);
      
      // Update settings via the hook
      updateSettings(data);
    } catch (error) {
      console.error('Error submitting regional settings:', error);
      setShowAlert({ type: 'danger', message: 'Failed to update regional settings' });
    }
  };

  return (
    <>
      <PageTitle title="Regional & Localization Settings" subName="General Settings" />
      
      {showAlert && (
        <Alert variant={showAlert.type} dismissible onClose={() => setShowAlert(null)}>
          {showAlert.message}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <CardTitle as="h5" className="mb-1">Regional & Localization Settings</CardTitle>
              <p className="text-muted mb-0">
                Configure timezone, currency, language, and regional compliance settings
              </p>
            </div>
            <IconifyIcon icon="material-symbols:language" className="text-primary fs-2" />
          </div>
        </CardHeader>
        <CardBody>
          {isLoadingData ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Loading regional settings...</p>
            </div>
          ) : (
            <Form onSubmit={handleSubmit(onSubmit)}>
            {/* Date & Time Configuration */}
            <Row className="mb-4">
              <Col xs={12}>
                <h5 className="border-bottom pb-2 mb-3">
                  <IconifyIcon icon="material-symbols:schedule" className="me-2 text-primary" />
                  Date & Time Configuration
                </h5>
              </Col>
              
              <Col md={6} className="mb-3">
                <Form.Label>Timezone</Form.Label>
                <Controller
                  name="timezone"
                  control={control}
                  render={({ field }) => (
                    <Form.Select {...field} className={errors.timezone ? 'is-invalid' : ''}>
                      {timezones.map(tz => (
                        <option key={tz.value} value={tz.value}>{tz.label}</option>
                      ))}
                    </Form.Select>
                  )}
                />
                {errors.timezone && <Form.Control.Feedback type="invalid">{errors.timezone.message}</Form.Control.Feedback>}
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Date Format</Form.Label>
                <Controller
                  name="dateFormat"
                  control={control}
                  render={({ field }) => (
                    <Form.Select {...field} className={errors.dateFormat ? 'is-invalid' : ''}>
                      {dateFormats.map(format => (
                        <option key={format.value} value={format.value}>{format.label}</option>
                      ))}
                    </Form.Select>
                  )}
                />
                {errors.dateFormat && <Form.Control.Feedback type="invalid">{errors.dateFormat.message}</Form.Control.Feedback>}
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Time Format</Form.Label>
                <Controller
                  name="timeFormat"
                  control={control}
                  render={({ field }) => (
                    <Form.Select {...field} className={errors.timeFormat ? 'is-invalid' : ''}>
                      <option value="12">12 Hour (AM/PM)</option>
                      <option value="24">24 Hour</option>
                    </Form.Select>
                  )}
                />
                {errors.timeFormat && <Form.Control.Feedback type="invalid">{errors.timeFormat.message}</Form.Control.Feedback>}
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Week Start Day</Form.Label>
                <Controller
                  name="weekStartDay"
                  control={control}
                  render={({ field }) => (
                    <Form.Select {...field} className={errors.weekStartDay ? 'is-invalid' : ''}>
                      <option value="sunday">Sunday</option>
                      <option value="monday">Monday</option>
                    </Form.Select>
                  )}
                />
                {errors.weekStartDay && <Form.Control.Feedback type="invalid">{errors.weekStartDay.message}</Form.Control.Feedback>}
              </Col>
            </Row>

            {/* Currency & Number Format */}
            <Row className="mb-4">
              <Col xs={12}>
                <h5 className="border-bottom pb-2 mb-3">
                  <IconifyIcon icon="material-symbols:payments" className="me-2 text-success" />
                  Currency & Number Format
                </h5>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Currency</Form.Label>
                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <Form.Select {...field} className={errors.currency ? 'is-invalid' : ''}>
                      {currencies.map(currency => (
                        <option key={currency.value} value={currency.value}>{currency.label}</option>
                      ))}
                    </Form.Select>
                  )}
                />
                {errors.currency && <Form.Control.Feedback type="invalid">{errors.currency.message}</Form.Control.Feedback>}
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Currency Position</Form.Label>
                <Controller
                  name="currencyPosition"
                  control={control}
                  render={({ field }) => (
                    <Form.Select {...field} className={errors.currencyPosition ? 'is-invalid' : ''}>
                      <option value="before">Before Amount (GH₵1,000)</option>
                      <option value="after">After Amount (1,000 GH₵)</option>
                    </Form.Select>
                  )}
                />
                {errors.currencyPosition && <Form.Control.Feedback type="invalid">{errors.currencyPosition.message}</Form.Control.Feedback>}
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Number Format</Form.Label>
                <Controller
                  name="numberFormat"
                  control={control}
                  render={({ field }) => (
                    <Form.Select {...field} className={errors.numberFormat ? 'is-invalid' : ''}>
                      <option value="standard">Standard (100,000)</option>
                      <option value="international">International (100,000)</option>
                      <option value="european">European (100.000)</option>
                    </Form.Select>
                  )}
                />
                {errors.numberFormat && <Form.Control.Feedback type="invalid">{errors.numberFormat.message}</Form.Control.Feedback>}
              </Col>
            </Row>

            {/* Language & Localization */}
            <Row className="mb-4">
              <Col xs={12}>
                <h5 className="border-bottom pb-2 mb-3">
                  <IconifyIcon icon="material-symbols:translate" className="me-2 text-info" />
                  Language & Localization
                </h5>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Primary Language</Form.Label>
                <Controller
                  name="primaryLanguage"
                  control={control}
                  render={({ field }) => (
                    <Form.Select {...field} className={errors.primaryLanguage ? 'is-invalid' : ''}>
                      {languages.map(lang => (
                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                      ))}
                    </Form.Select>
                  )}
                />
                {errors.primaryLanguage && <Form.Control.Feedback type="invalid">{errors.primaryLanguage.message}</Form.Control.Feedback>}
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Supported Languages</Form.Label>
                <div className="border rounded p-2" style={{ maxHeight: '120px', overflowY: 'auto' }}>
                  {languages.map(lang => (
                    <div key={lang.value}>
                      <Controller
                        name="supportedLanguages"
                        control={control}
                        render={({ field }) => (
                          <Form.Check
                            type="checkbox"
                            id={`lang-${lang.value}`}
                            label={lang.label}
                            checked={field.value?.includes(lang.value)}
                            onChange={(e) => {
                              const currentValues = field.value || [];
                              if (e.target.checked) {
                                field.onChange([...currentValues, lang.value]);
                              } else {
                                field.onChange(currentValues.filter((val: string) => val !== lang.value));
                              }
                            }}
                          />
                        )}
                      />
                    </div>
                  ))}
                </div>
              {errors.supportedLanguages && <div className="text-danger small">{errors.supportedLanguages.message}</div>}
              </Col>

              <Col md={6} className="mb-3">
                <Controller
                  name="rtlSupport"
                  control={control}
                  render={({ field }) => (
                    <Form.Check
                      type="switch"
                      id="rtlSupport"
                      label="Enable RTL (Right-to-Left) Support"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <small className="text-muted">Support for Arabic, Hebrew, and other RTL languages</small>
              </Col>
            </Row>

            {/* Regional Format Settings */}
            <Row className="mb-4">
              <Col xs={12}>
                <h5 className="border-bottom pb-2 mb-3">
                  <IconifyIcon icon="material-symbols:location-on" className="me-2 text-warning" />
                  Regional Format Settings
                </h5>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Address Format</Form.Label>
                <Controller
                  name="addressFormat"
                  control={control}
                  render={({ field }) => (
                    <Form.Select {...field} className={errors.addressFormat ? 'is-invalid' : ''}>
                      <option value="ghana">Ghana Format (House No., Street, Area, City, Region)</option>
                      <option value="us">US Format (Street, City, State, ZIP)</option>
                      <option value="uk">UK Format (Building, Street, Town, County, Postcode)</option>
                      <option value="international">International Format</option>
                    </Form.Select>
                  )}
                />
                {errors.addressFormat && <Form.Control.Feedback type="invalid">{errors.addressFormat.message}</Form.Control.Feedback>}
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Phone Number Format</Form.Label>
                <Controller
                  name="phoneFormat"
                  control={control}
                  render={({ field }) => (
                    <Form.Select {...field} className={errors.phoneFormat ? 'is-invalid' : ''}>
                      <option value="ghana">Ghana (+233 XX XXX XXXX)</option>
                      <option value="us">US (+1 XXX XXX XXXX)</option>
                      <option value="international">International</option>
                    </Form.Select>
                  )}
                />
                {errors.phoneFormat && <Form.Control.Feedback type="invalid">{errors.phoneFormat.message}</Form.Control.Feedback>}
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Postal Code Format</Form.Label>
                <Controller
                  name="postalCodeFormat"
                  control={control}
                  render={({ field }) => (
                    <Form.Select {...field} className={errors.postalCodeFormat ? 'is-invalid' : ''}>
                      <option value="ghana">Ghana (GA-123-4567)</option>
                      <option value="us">US (5 digits - 12345)</option>
                      <option value="uk">UK (Format - SW1A 1AA)</option>
                      <option value="international">International</option>
                    </Form.Select>
                  )}
                />
                {errors.postalCodeFormat && <Form.Control.Feedback type="invalid">{errors.postalCodeFormat.message}</Form.Control.Feedback>}
              </Col>
            </Row>

            {/* Regional Compliance */}
            <Row className="mb-4">
              <Col xs={12}>
                <h5 className="border-bottom pb-2 mb-3">
                  <IconifyIcon icon="material-symbols:policy" className="me-2 text-danger" />
                  Regional Compliance
                </h5>
              </Col>

              <Col md={4} className="mb-3">
                <Controller
                  name="gstEnabled"
                  control={control}
                  render={({ field }) => (
                    <Form.Check
                      type="switch"
                      id="gstEnabled"
                      label="Enable GST Mode"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <small className="text-muted">Enable GST-style tax compliance for supported regions</small>
              </Col>

              <Col md={4} className="mb-3">
                <Controller
                  name="vatEnabled"
                  control={control}
                  render={({ field }) => (
                    <Form.Check
                      type="switch"
                      id="vatEnabled"
                      label="Enable VAT"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <small className="text-muted">Value Added Tax compliance</small>
              </Col>

              <Col md={4} className="mb-3">
                <Controller
                  name="gdprCompliance"
                  control={control}
                  render={({ field }) => (
                    <Form.Check
                      type="switch"
                      id="gdprCompliance"
                      label="GDPR Compliance"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <small className="text-muted">General Data Protection Regulation</small>
              </Col>

              <Col md={4} className="mb-3">
                <Controller
                  name="cookieConsent"
                  control={control}
                  render={({ field }) => (
                    <Form.Check
                      type="switch"
                      id="cookieConsent"
                      label="Cookie Consent Banner"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <small className="text-muted">Show cookie consent notification</small>
              </Col>

              <Col md={4} className="mb-3">
                <Controller
                  name="dataLocalization"
                  control={control}
                  render={({ field }) => (
                    <Form.Check
                      type="switch"
                      id="dataLocalization"
                      label="Data Localization"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <small className="text-muted">Store data within country borders</small>
              </Col>
            </Row>

            {/* Regional Status Overview */}
            <Row className="mb-4">
              <Col xs={12}>
                <h5 className="border-bottom pb-2 mb-3">
                  <IconifyIcon icon="material-symbols:analytics" className="me-2 text-secondary" />
                  Regional Status Overview
                </h5>
              </Col>

              <Col md={3} className="mb-3">
                <Card className="bg-primary bg-opacity-10 border-primary">
                  <CardBody className="text-center">
                    <IconifyIcon icon="material-symbols:language" className="display-6 text-primary mb-2" />
                    <h5 className="text-primary mb-1">{watchedLanguages?.length || 0}</h5>
                    <small className="text-muted">Active Languages</small>
                  </CardBody>
                </Card>
              </Col>

              <Col md={3} className="mb-3">
                <Card className="bg-success bg-opacity-10 border-success">
                  <CardBody className="text-center">
                    <IconifyIcon icon="material-symbols:schedule" className="display-6 text-success mb-2" />
                    <h5 className="text-success mb-1">{watchedTimezone || 'Africa/Accra'}</h5>
                    <small className="text-muted">Active Timezone</small>
                  </CardBody>
                </Card>
              </Col>

              <Col md={3} className="mb-3">
                <Card className="bg-info bg-opacity-10 border-info">
                  <CardBody className="text-center">
                    <IconifyIcon icon="material-symbols:payments" className="display-6 text-info mb-2" />
                    <h5 className="text-info mb-1">{watchedCurrency || 'GHS'}</h5>
                    <small className="text-muted">Primary Currency</small>
                  </CardBody>
                </Card>
              </Col>

              <Col md={3} className="mb-3">
                <Card className="bg-warning bg-opacity-10 border-warning">
                  <CardBody className="text-center">
                    <IconifyIcon icon="material-symbols:policy" className="display-6 text-warning mb-2" />
                    <h5 className="text-warning mb-1">{complianceEnabledCount}/5</h5>
                    <small className="text-muted">Compliance Active</small>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            {/* Action Buttons */}
            <div className="d-flex justify-content-end gap-2 mt-4">
                  <Button
                    variant="outline-secondary"
                    onClick={() => window.history.back()}
                  >
                    <IconifyIcon icon="material-symbols:arrow-back" className="me-1" />
                    Back
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => window.location.reload()}
                  >
                    <IconifyIcon icon="material-symbols:refresh" className="me-1" />
                    Reset Changes
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isUpdating || isLoadingData}
                  >
                    {isUpdating ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <IconifyIcon icon="material-symbols:save" className="me-1" />
                        Save Regional Settings
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            )}
          </CardBody>
        </Card>
      </>
    );
  }
