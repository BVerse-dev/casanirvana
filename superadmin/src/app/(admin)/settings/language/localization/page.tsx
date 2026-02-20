'use client';

import { useState } from 'react';
import { Card, Row, Col, Button, Form, Tab, Tabs, Badge, Alert } from 'react-bootstrap';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Components
import PageTitle from '@/components/PageTitle';
import SelectFormInput from '@/components/from/SelectFormInput';
import TextFormInput from '@/components/from/TextFormInput';

// Icons
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface LocaleRegion {
  code: string;
  name: string;
  language: string;
  country: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  currencyCode: string;
  currencySymbol: string;
  firstDayOfWeek: string;
  isDefault?: boolean;
}

interface LocalizationFormData {
  autoDetectRegion?: boolean;
  fallbackRegion: string;
  enableRegionalOverrides?: boolean;
  syncWithBrowser?: boolean;
  regions: LocaleRegion[];
}

// Form validation schema
const localizationSchema = yup.object({
  regions: yup.array().of(
    yup.object({
      code: yup.string().required('Region code is required'),
      name: yup.string().required('Region name is required'),
      language: yup.string().required('Language is required'),
      country: yup.string().required('Country is required'),
      dateFormat: yup.string().required('Date format is required'),
      timeFormat: yup.string().required('Time format is required'),
      numberFormat: yup.string().required('Number format is required'),
      currencyCode: yup.string().required('Currency code is required'),
      currencySymbol: yup.string().required('Currency symbol is required'),
      firstDayOfWeek: yup.string().required('First day of week is required'),
      isDefault: yup.boolean(),
    })
  ).required(),
  autoDetectRegion: yup.boolean(),
  fallbackRegion: yup.string().required('Fallback region is required'),
  enableRegionalOverrides: yup.boolean(),
  syncWithBrowser: yup.boolean(),
});

const LocalizationPage = () => {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('regions');

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    register,
    formState: { errors, isDirty }
  } = useForm<LocalizationFormData>({
    resolver: yupResolver(localizationSchema),
    defaultValues: {
      regions: [
        {
          code: 'en-US',
          name: 'United States',
          language: 'en',
          country: 'US',
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12h',
          numberFormat: 'en-US',
          currencyCode: 'USD',
          currencySymbol: '$',
          firstDayOfWeek: '0',
          isDefault: true,
        },
        {
          code: 'en-GB',
          name: 'United Kingdom',
          language: 'en',
          country: 'GB',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '24h',
          numberFormat: 'en-GB',
          currencyCode: 'GBP',
          currencySymbol: '£',
          firstDayOfWeek: '1',
          isDefault: false,
        }
      ],
      autoDetectRegion: true,
      fallbackRegion: 'en-US',
      enableRegionalOverrides: true,
      syncWithBrowser: false,
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'regions'
  });

  const watchedValues = watch();

  // Available options
  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' },
    { value: 'ar', label: 'Arabic' },
  ];

  const countries = [
    { value: 'US', label: 'United States' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'CA', label: 'Canada' },
    { value: 'AU', label: 'Australia' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'ES', label: 'Spain' },
    { value: 'IT', label: 'Italy' },
    { value: 'IN', label: 'India' },
    { value: 'JP', label: 'Japan' },
    { value: 'CN', label: 'China' },
    { value: 'BR', label: 'Brazil' },
  ];

  const dateFormats = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
    { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY' },
  ];

  const timeFormats = [
    { value: '12h', label: '12 Hour' },
    { value: '24h', label: '24 Hour' },
  ];

  const numberFormats = [
    { value: 'en-US', label: 'US (1,234.56)' },
    { value: 'en-GB', label: 'UK (1,234.56)' },
    { value: 'de-DE', label: 'German (1.234,56)' },
    { value: 'fr-FR', label: 'French (1 234,56)' },
  ];

  const currencies = [
    { value: 'USD', symbol: '$', label: 'US Dollar' },
    { value: 'EUR', symbol: '€', label: 'Euro' },
    { value: 'GBP', symbol: '£', label: 'British Pound' },
    { value: 'JPY', symbol: '¥', label: 'Japanese Yen' },
    { value: 'CAD', symbol: 'C$', label: 'Canadian Dollar' },
    { value: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
  ];

  const daysOfWeek = [
    { value: '0', label: 'Sunday' },
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday' },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday' },
  ];

  const onSubmit = async (data: LocalizationFormData) => {
    setLoading(true);
    try {
      // TODO: Implement API call to save localization settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Localization settings saved:', data);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving localization settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNewRegion = () => {
    append({
      code: '',
      name: '',
      language: 'en',
      country: 'US',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      numberFormat: 'en-US',
      currencyCode: 'USD',
      currencySymbol: '$',
      firstDayOfWeek: '0',
      isDefault: false,
    });
  };

  const setAsDefault = (index: number) => {
    // Set all regions as non-default first
    fields.forEach((_, idx) => {
      setValue(`regions.${idx}.isDefault`, false);
    });
    // Set the selected region as default
    setValue(`regions.${index}.isDefault`, true);
    setValue('fallbackRegion', watchedValues.regions[index]?.code || '');
  };

  return (
    <>
      <PageTitle 
        title="Localization Settings" 
        subName="Configure regional and locale-specific settings"
      />

      {showSuccess && (
        <Alert variant="success" className="d-flex align-items-center">
          <IconifyIcon icon="material-symbols:check" className="me-2" />
          Localization settings saved successfully!
        </Alert>
      )}

      <Row>
        <Col xs={12}>
          <Card>
            <Card.Header>
              <Card.Title>Localization Configuration</Card.Title>
            </Card.Header>
            <Card.Body>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k || 'regions')}
                className="mb-4"
              >
                <Tab eventKey="regions" title="Regional Settings">
                  <Form onSubmit={handleSubmit(onSubmit)}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5>Configure Regional Locales</h5>
                      <Button variant="outline-primary" onClick={addNewRegion}>
                        <IconifyIcon icon="material-symbols:add" className="me-2" />
                        Add Region
                      </Button>
                    </div>

                    {fields.map((field, index) => (
                      <Card key={field.id} className="mb-4">
                        <Card.Header className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <IconifyIcon icon="material-symbols:location-on" className="me-2" />
                            <h6 className="mb-0">
                              Region {index + 1}
                              {watchedValues.regions?.[index]?.isDefault && (
                                <Badge bg="primary" className="ms-2">Default</Badge>
                              )}
                            </h6>
                          </div>
                          <div>
                            {!watchedValues.regions?.[index]?.isDefault && (
                              <Button
                                variant="outline-success"
                                size="sm"
                                className="me-2"
                                onClick={() => setAsDefault(index)}
                              >
                                Set as Default
                              </Button>
                            )}
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => remove(index)}
                              disabled={fields.length === 1}
                            >
                              <IconifyIcon icon="material-symbols:delete" />
                            </Button>
                          </div>
                        </Card.Header>
                        <Card.Body>
                          <Row>
                            <Col md={6}>
                              <TextFormInput
                                control={control}
                                name={`regions.${index}.code`}
                                label="Region Code"
                                placeholder="e.g., en-US"
                                containerClassName="mb-3"
                              />
                            </Col>
                            <Col md={6}>
                              <TextFormInput
                                control={control}
                                name={`regions.${index}.name`}
                                label="Region Name"
                                placeholder="e.g., United States"
                                containerClassName="mb-3"
                              />
                            </Col>
                            <Col md={6}>
                              <SelectFormInput
                                control={control}
                                name={`regions.${index}.language`}
                                label="Language"
                                containerClassName="mb-3"
                                options={languages}
                              />
                            </Col>
                            <Col md={6}>
                              <SelectFormInput
                                control={control}
                                name={`regions.${index}.country`}
                                label="Country"
                                containerClassName="mb-3"
                                options={countries}
                              />
                            </Col>
                            <Col md={4}>
                              <SelectFormInput
                                control={control}
                                name={`regions.${index}.dateFormat`}
                                label="Date Format"
                                containerClassName="mb-3"
                                options={dateFormats}
                              />
                            </Col>
                            <Col md={4}>
                              <SelectFormInput
                                control={control}
                                name={`regions.${index}.timeFormat`}
                                label="Time Format"
                                containerClassName="mb-3"
                                options={timeFormats}
                              />
                            </Col>
                            <Col md={4}>
                              <SelectFormInput
                                control={control}
                                name={`regions.${index}.numberFormat`}
                                label="Number Format"
                                containerClassName="mb-3"
                                options={numberFormats}
                              />
                            </Col>
                            <Col md={4}>
                              <SelectFormInput
                                control={control}
                                name={`regions.${index}.currencyCode`}
                                label="Currency"
                                containerClassName="mb-3"
                                options={currencies.map(currency => ({
                                  value: currency.value,
                                  label: `${currency.symbol} ${currency.label}`
                                }))}
                              />
                            </Col>
                            <Col md={4}>
                              <TextFormInput
                                control={control}
                                name={`regions.${index}.currencySymbol`}
                                label="Currency Symbol"
                                containerClassName="mb-3"
                              />
                            </Col>
                            <Col md={4}>
                              <SelectFormInput
                                control={control}
                                name={`regions.${index}.firstDayOfWeek`}
                                label="First Day of Week"
                                containerClassName="mb-3"
                                options={daysOfWeek}
                              />
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    ))}
                  </Form>
                </Tab>

                <Tab eventKey="global" title="Global Settings">
                  <Card>
                    <Card.Header className="d-flex align-items-center">
                      <IconifyIcon icon="material-symbols:settings" className="me-2" />
                      <h6 className="mb-0">Global Localization Settings</h6>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <Col lg={6}>
                          <SelectFormInput
                            control={control}
                            name="fallbackRegion"
                            label="Fallback Region"
                            containerClassName="mb-3"
                            options={watchedValues.regions?.map(region => ({
                              value: region.code,
                              label: `${region.name} (${region.code})`
                            })) || []}
                          />

                          <div className="mb-3">
                            <Form.Check
                              type="checkbox"
                              id="autoDetectRegion"
                              label="Auto-detect user region from browser/IP"
                              {...register('autoDetectRegion')}
                            />
                          </div>

                          <div className="mb-3">
                            <Form.Check
                              type="checkbox"
                              id="enableRegionalOverrides"
                              label="Allow users to override regional settings"
                              {...register('enableRegionalOverrides')}
                            />
                          </div>

                          <div className="mb-3">
                            <Form.Check
                              type="checkbox"
                              id="syncWithBrowser"
                              label="Sync with browser locale settings"
                              {...register('syncWithBrowser')}
                            />
                          </div>
                        </Col>
                        <Col lg={6}>
                          <div className="p-3 bg-light rounded">
                            <h6 className="mb-3">Current Regional Preview</h6>
                            <div className="small">
                              <div className="mb-2">
                                <strong>Date:</strong> {new Date().toLocaleDateString()}
                              </div>
                              <div className="mb-2">
                                <strong>Time:</strong> {new Date().toLocaleTimeString()}
                              </div>
                              <div className="mb-2">
                                <strong>Number:</strong> 1,234.56
                              </div>
                              <div className="mb-2">
                                <strong>Currency:</strong> $1,234.56
                              </div>
                              <div className="mb-2">
                                <strong>Week starts:</strong> Sunday
                              </div>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Tab>
              </Tabs>

              {/* Submit Button */}
              <div className="d-flex justify-content-end">
                <Button 
                  variant="primary" 
                  onClick={handleSubmit(onSubmit)}
                  disabled={loading || !isDirty}
                  className="d-flex align-items-center"
                >
                  {loading ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <IconifyIcon icon="material-symbols:save" className="me-2" />
                      Save Localization Settings
                    </>
                  )}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default LocalizationPage;
