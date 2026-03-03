'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, CardTitle, Row, Col, Button, Form, Alert } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Components
import PageTitle from '@/components/PageTitle';
import SelectFormInput from '@/components/from/SelectFormInput';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useBulkUpdateSettings, useSettingsCategory } from '@/hooks/useSettings';

// Form validation schema
const defaultLanguageSchema = yup.object({
  defaultLanguage: yup.string().required('Default language is required'),
  fallbackLanguage: yup.string().required('Fallback language is required'),
  autoDetect: yup.boolean().optional(),
  rtlSupport: yup.boolean().optional(),
  dateFormat: yup.string().required('Date format is required'),
  timeFormat: yup.string().required('Time format is required'),
  numberFormat: yup.string().required('Number format is required'),
  currencyFormat: yup.string().required('Currency format is required'),
  timezone: yup.string().required('Timezone is required'),
});

interface DefaultLanguageFormData {
  defaultLanguage: string;
  fallbackLanguage: string;
  autoDetect?: boolean;
  rtlSupport?: boolean;
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  currencyFormat: string;
  timezone: string;
}

const defaultLanguageSettings: DefaultLanguageFormData = {
  defaultLanguage: 'en',
  fallbackLanguage: 'en',
  autoDetect: true,
  rtlSupport: false,
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '12-hour',
  numberFormat: '1,000.00',
  currencyFormat: 'GHS (GH₵)',
  timezone: 'Africa/Accra',
};

const DefaultLanguagePage = () => {
  const [showAlert, setShowAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const { data: settingsData } = useSettingsCategory('localization', 'default_language');
  const updateSettings = useBulkUpdateSettings();

  const { control, handleSubmit, reset, formState: { isDirty, isSubmitting } } = useForm<DefaultLanguageFormData>({
    resolver: yupResolver(defaultLanguageSchema),
    defaultValues: defaultLanguageSettings,
  });

  useEffect(() => {
    if (!settingsData) {
      return;
    }

    reset({
      ...defaultLanguageSettings,
      ...settingsData,
    });
  }, [settingsData, reset]);

  const onSubmit = async (data: DefaultLanguageFormData) => {
    try {
      await updateSettings.mutateAsync({
        category: 'localization',
        subcategory: 'default_language',
        settings: data,
      });
      
      setShowAlert({ type: 'success', message: 'Default language settings updated successfully!' });
      setTimeout(() => setShowAlert(null), 5000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setShowAlert({ type: 'danger', message: 'Failed to save settings. Please try again.' });
      setTimeout(() => setShowAlert(null), 5000);
    }
  };

  const languageOptions = [
    { value: 'en', label: 'English (Ghana)' },
    { value: 'en-gb', label: 'English (United Kingdom)' },
    { value: 'es', label: 'Spanish (Spain)' },
    { value: 'fr', label: 'French (West Africa)' },
    { value: 'de', label: 'German (Germany)' },
    { value: 'it', label: 'Italian (Italy)' },
    { value: 'pt', label: 'Portuguese (Portugal)' },
    { value: 'ar', label: 'Arabic' },
    { value: 'zh', label: 'Chinese (Simplified)' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' },
    { value: 'hi', label: 'Hindi' },
    { value: 'ru', label: 'Russian' },
  ];

  const dateFormatOptions = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US Format)' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (European Format)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO Format)' },
    { value: 'DD MMM YYYY', label: 'DD MMM YYYY (e.g., 31 Dec 2023)' },
    { value: 'MMM DD, YYYY', label: 'MMM DD, YYYY (e.g., Dec 31, 2023)' },
  ];

  const timeFormatOptions = [
    { value: '12-hour', label: '12-hour (AM/PM)' },
    { value: '24-hour', label: '24-hour' },
  ];

  const numberFormatOptions = [
    { value: '1,000.00', label: '1,000.00 (US/UK)' },
    { value: '1.000,00', label: '1.000,00 (German/European)' },
    { value: '1 000,00', label: '1 000,00 (French)' },
    { value: '1000.00', label: '1000.00 (No separators)' },
  ];

  const currencyFormatOptions = [
    { value: 'GHS (GH₵)', label: 'GHS (GH₵) - Ghana Cedi' },
    { value: 'USD ($)', label: 'USD ($) - US Dollar' },
    { value: 'EUR (€)', label: 'EUR (€) - Euro' },
    { value: 'GBP (£)', label: 'GBP (£) - British Pound' },
    { value: 'JPY (¥)', label: 'JPY (¥) - Japanese Yen' },
    { value: 'INR (₹)', label: 'INR (₹) - Indian Rupee' },
    { value: 'AED (د.إ)', label: 'AED (د.إ) - UAE Dirham' },
  ];

  const timezoneOptions = [
    { value: 'Africa/Accra', label: 'Accra (GMT)' },
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
    { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
    { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
    { value: 'Europe/London', label: 'London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
    { value: 'Asia/Dubai', label: 'Dubai (UTC+04:00)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Kolkata', label: 'Kolkata (UTC+05:30)' },
  ];

  return (
    <>
      <PageTitle title="Default Language Settings" subName="Language" />

      {showAlert && (
        <Alert variant={showAlert.type} className="mb-4" dismissible onClose={() => setShowAlert(null)}>
          <div className="d-flex align-items-center">
            <IconifyIcon icon={showAlert.type === 'success' ? 'material-symbols:check-circle' : 'material-symbols:error'} className="me-2" />
            {showAlert.message}
          </div>
        </Alert>
      )}

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <Col xl={12}>
            {/* Primary Language Settings */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="mb-0">
                  <IconifyIcon icon="material-symbols:language" className="me-2" />
                  Primary Language Configuration
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col md={6}>
                    <SelectFormInput
                      control={control}
                      name="defaultLanguage"
                      label="Default Language"
                      options={languageOptions}
                      containerClassName="mb-3"
                    />
                  </Col>
                  <Col md={6}>
                    <SelectFormInput
                      control={control}
                      name="fallbackLanguage"
                      label="Fallback Language"
                      options={languageOptions}
                      containerClassName="mb-3"
                    />
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Controller
                      name="autoDetect"
                      control={control}
                      render={({ field }) => (
                        <Form.Check
                          type="switch"
                          id="autoDetect"
                          label="Auto-detect user language from browser"
                          checked={field.value}
                          onChange={field.onChange}
                          className="mb-3"
                        />
                      )}
                    />
                  </Col>
                  <Col md={6}>
                    <Controller
                      name="rtlSupport"
                      control={control}
                      render={({ field }) => (
                        <Form.Check
                          type="switch"
                          id="rtlSupport"
                          label="Enable Right-to-Left (RTL) language support"
                          checked={field.value}
                          onChange={field.onChange}
                          className="mb-3"
                        />
                      )}
                    />
                  </Col>
                </Row>
              </CardBody>
            </Card>

            {/* Regional Format Settings */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="mb-0">
                  <IconifyIcon icon="material-symbols:location-on" className="me-2" />
                  Regional Format Settings
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col md={6}>
                    <SelectFormInput
                      control={control}
                      name="dateFormat"
                      label="Date Format"
                      options={dateFormatOptions}
                      containerClassName="mb-3"
                    />
                  </Col>
                  <Col md={6}>
                    <SelectFormInput
                      control={control}
                      name="timeFormat"
                      label="Time Format"
                      options={timeFormatOptions}
                      containerClassName="mb-3"
                    />
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <SelectFormInput
                      control={control}
                      name="numberFormat"
                      label="Number Format"
                      options={numberFormatOptions}
                      containerClassName="mb-3"
                    />
                  </Col>
                  <Col md={6}>
                    <SelectFormInput
                      control={control}
                      name="currencyFormat"
                      label="Currency Format"
                      options={currencyFormatOptions}
                      containerClassName="mb-3"
                    />
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <SelectFormInput
                      control={control}
                      name="timezone"
                      label="Default Timezone"
                      options={timezoneOptions}
                      containerClassName="mb-3"
                    />
                  </Col>
                </Row>
              </CardBody>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardBody>
                <div className="d-flex justify-content-end gap-2">
                  <Button variant="outline-secondary" onClick={() => reset()} disabled={!isDirty || isSubmitting}>
                    <IconifyIcon icon="material-symbols:refresh" className="me-1" />
                    Reset
                  </Button>
                  <Button variant="primary" type="submit" disabled={!isDirty || isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <IconifyIcon icon="material-symbols:save" className="me-1" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default DefaultLanguagePage;
