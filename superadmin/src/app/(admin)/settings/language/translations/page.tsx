'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, Row, Col, Button, Form, Tab, Tabs, Badge, Alert, Modal, Table, ProgressBar } from 'react-bootstrap';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Components
import PageTitle from '@/components/PageTitle';
import ComponentContainerCard from '@/components/ComponentContainerCard';
import SelectFormInput from '@/components/from/SelectFormInput';
import TextFormInput from '@/components/from/TextFormInput';
import TextAreaFormInput from '@/components/from/TextAreaFormInput';

// Icons
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useBulkUpdateSettings, useSettingsCategory } from '@/hooks/useSettings';

interface Translation {
  key: string;
  category: string;
  english: string;
  translations: Record<string, string>;
  description?: string;
  context?: string;
}

interface TranslationSettings {
  translations: Translation[];
  activeLanguages: string[];
  translationMode: 'manual' | 'auto' | 'hybrid';
  autoTranslateApi?: string;
  fallbackToEnglish: boolean;
  showMissingKeys: boolean;
}

type EditableTranslation = Translation & { index: number };

const defaultTranslationSettings: TranslationSettings = {
  translations: [
    {
      key: 'common.save',
      category: 'Common',
      english: 'Save',
      translations: {
        es: 'Guardar',
        fr: 'Enregistrer',
        de: 'Speichern',
        pt: 'Salvar',
      },
      description: 'Save button text',
      context: 'Used in forms and modals',
    },
    {
      key: 'common.cancel',
      category: 'Common',
      english: 'Cancel',
      translations: {
        es: 'Cancelar',
        fr: 'Annuler',
        de: 'Abbrechen',
        pt: 'Cancelar',
      },
      description: 'Cancel button text',
      context: 'Used in forms and modals',
    },
    {
      key: 'navigation.dashboard',
      category: 'Navigation',
      english: 'Dashboard',
      translations: {
        es: 'Panel de Control',
        fr: 'Tableau de Bord',
        de: 'Dashboard',
        pt: 'Painel',
      },
      description: 'Dashboard menu item',
      context: 'Main navigation menu',
    },
    {
      key: 'units.title',
      category: 'Units',
      english: 'Units Management',
      translations: {
        es: 'Gestión de Unidades',
        fr: 'Gestion des Unités',
        de: '',
        pt: 'Gestão de Unidades',
      },
      description: 'Units page title',
      context: 'Page header',
    },
  ],
  activeLanguages: ['en', 'es', 'fr', 'de', 'pt'],
  translationMode: 'manual',
  autoTranslateApi: '',
  fallbackToEnglish: true,
  showMissingKeys: true,
};

const translationSchema = yup.object({
  translations: yup.array().of(
    yup.object({
      key: yup.string().required('Translation key is required'),
      category: yup.string().required('Category is required'),
      english: yup.string().required('English text is required'),
      translations: yup.object().default({}),
      description: yup.string().optional(),
      context: yup.string().optional(),
    })
  ).required(),
  activeLanguages: yup.array().of(yup.string().required()).required(),
  translationMode: yup.string().oneOf(['manual', 'auto', 'hybrid']).required(),
  autoTranslateApi: yup.string().optional().default(''),
  fallbackToEnglish: yup.boolean().required(),
  showMissingKeys: yup.boolean().required(),
});

const TranslationsPage = () => {
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState<{ type: 'success' | 'danger' | 'info'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState('translations');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState<EditableTranslation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const { data: settingsData, isLoading, error } = useSettingsCategory('localization', 'translations');
  const updateSettings = useBulkUpdateSettings();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    register,
    reset,
    formState: { errors, isDirty }
  } = useForm<TranslationSettings>({
    resolver: yupResolver(translationSchema),
    defaultValues: defaultTranslationSettings
  });

  const { fields: translationFields, append: appendTranslation, remove: removeTranslation, replace: replaceTranslations } = useFieldArray({
    control,
    name: 'translations'
  });

  useEffect(() => {
    if (!settingsData) {
      return;
    }

    const incoming = settingsData as Partial<TranslationSettings>;
    reset({
      ...defaultTranslationSettings,
      ...incoming,
      translations: Array.isArray(incoming.translations) && incoming.translations.length > 0
        ? incoming.translations
        : defaultTranslationSettings.translations,
      activeLanguages: Array.isArray(incoming.activeLanguages) && incoming.activeLanguages.length > 0
        ? incoming.activeLanguages
        : defaultTranslationSettings.activeLanguages,
    });
  }, [reset, settingsData]);

  const watchedValues = watch();
  const hasStoredSettings = Boolean(settingsData && Object.keys(settingsData).length > 0);

  // Available languages
  const availableLanguages = [
    { value: 'en', label: 'English', flag: '🇺🇸', completion: 100 },
    { value: 'tw', label: 'Twi', flag: '🇬🇭', completion: 20 },
    { value: 'es', label: 'Spanish', flag: '🇪🇸', completion: 95 },
    { value: 'fr', label: 'French', flag: '🇫🇷', completion: 90 },
    { value: 'de', label: 'German', flag: '🇩🇪', completion: 75 },
    { value: 'pt', label: 'Portuguese', flag: '🇵🇹', completion: 85 },
    { value: 'it', label: 'Italian', flag: '🇮🇹', completion: 60 },
    { value: 'zh', label: 'Chinese', flag: '🇨🇳', completion: 30 },
    { value: 'ja', label: 'Japanese', flag: '🇯🇵', completion: 25 },
    { value: 'ar', label: 'Arabic', flag: '🇸🇦', completion: 40 },
  ];

  const categories = [
    'Common',
    'Navigation',
    'Forms',
    'Units',
    'Users',
    'Visitors',
    'Complaints',
    'Maintenance',
    'Payments',
    'Amenities',
    'Services',
    'Messages',
    'Settings',
    'Errors',
    'Notifications'
  ];

  const translationModes = [
    { value: 'manual', label: 'Manual Translation Only' },
    { value: 'auto', label: 'Automatic Translation' },
    { value: 'hybrid', label: 'Hybrid (Manual + Auto)' },
  ];

  const autoTranslateApis = [
    { value: 'google', label: 'Google Translate API' },
    { value: 'deepl', label: 'DeepL API' },
    { value: 'azure', label: 'Azure Translator' },
    { value: 'aws', label: 'AWS Translate' },
  ];

  const onSubmit = async (data: TranslationSettings) => {
    setLoading(true);
    try {
      await updateSettings.mutateAsync({
        category: 'localization',
        subcategory: 'translations',
        settings: data,
      });
      setShowAlert({ type: 'success', message: 'Translation settings saved successfully!' });
      setTimeout(() => setShowAlert(null), 3000);
    } catch (error) {
      console.error('Error saving translation settings:', error);
      setShowAlert({ type: 'danger', message: 'Failed to save translation settings. Please try again.' });
      setTimeout(() => setShowAlert(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const indexedTranslations = (watchedValues.translations || []).map((translation, index) => ({ translation, index }));

  const filteredTranslations = indexedTranslations.filter(({ translation }) => {
    const matchesSearch = translation.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         translation.english.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || translation.category === selectedCategory;
    const matchesLanguage =
      selectedLanguage === 'all' ||
      (selectedLanguage === 'missing' &&
        (watchedValues.activeLanguages || []).some(
          (langCode) =>
            langCode !== 'en' && !(translation.translations?.[langCode] || '').trim()
        )) ||
      Boolean((translation.translations?.[selectedLanguage] || '').trim());
    
    return matchesSearch && matchesCategory && matchesLanguage;
  });

  const getTranslationCompletion = (languageCode: string) => {
    if (!watchedValues.translations) return 0;
    const total = watchedValues.translations.length;
    const translated = watchedValues.translations.filter(t => t.translations[languageCode]).length;
    return Math.round((translated / total) * 100);
  };

  const addNewTranslation = () => {
    appendTranslation({
      key: '',
      category: 'Common',
      english: '',
      translations: {},
      description: '',
      context: ''
    });
  };

  const translationCategoryCount = new Set(
    (watchedValues.translations || []).map((translation) => translation.category).filter(Boolean)
  ).size;

  const editTranslation = (translation: Translation, index: number) => {
    setEditingTranslation({ ...translation, index });
    setShowEditModal(true);
  };

  const exportTranslations = () => {
    const data = JSON.stringify(watchedValues.translations, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'translations.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const normalizeImportedTranslation = (item: any): Translation | null => {
    if (!item || typeof item !== 'object') return null;
    const key = typeof item.key === 'string' ? item.key.trim() : '';
    const category = typeof item.category === 'string' ? item.category.trim() : '';
    const english = typeof item.english === 'string' ? item.english.trim() : '';

    if (!key || !category || !english) return null;

    const translations =
      item.translations && typeof item.translations === 'object' && !Array.isArray(item.translations)
        ? Object.entries(item.translations).reduce<Record<string, string>>((acc, [lang, value]) => {
            if (typeof value === 'string') acc[lang] = value;
            return acc;
          }, {})
        : {};

    return {
      key,
      category,
      english,
      translations,
      description: typeof item.description === 'string' ? item.description : '',
      context: typeof item.context === 'string' ? item.context : '',
    };
  };

  const handleImportTranslations = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const rawText = await file.text();
      const parsed = JSON.parse(rawText);

      let incomingTranslations: any[] = [];
      if (Array.isArray(parsed)) {
        incomingTranslations = parsed;
      } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.translations)) {
        incomingTranslations = parsed.translations;
      } else {
        throw new Error('Imported file must be an array of translations or a settings object containing a translations array.');
      }

      const normalized = incomingTranslations
        .map(normalizeImportedTranslation)
        .filter((item): item is Translation => Boolean(item));

      if (normalized.length === 0) {
        throw new Error('No valid translation entries found in the imported file.');
      }

      const dedupedByKey = new Map<string, Translation>();
      normalized.forEach((entry) => dedupedByKey.set(entry.key, entry));

      replaceTranslations(Array.from(dedupedByKey.values()));
      setValue('translations', Array.from(dedupedByKey.values()), { shouldDirty: true, shouldValidate: true });

      if (parsed && typeof parsed === 'object' && Array.isArray((parsed as any).activeLanguages)) {
        const validLanguages = (parsed as any).activeLanguages.filter((lang: unknown) => typeof lang === 'string');
        if (validLanguages.length > 0) {
          setValue('activeLanguages', Array.from(new Set(validLanguages)), { shouldDirty: true, shouldValidate: true });
        }
      }

      setShowAlert({
        type: 'success',
        message: `Imported ${dedupedByKey.size} translation key(s) successfully.`,
      });
      setTimeout(() => setShowAlert(null), 4000);
    } catch (error) {
      setShowAlert({
        type: 'danger',
        message: error instanceof Error ? error.message : 'Failed to import translations.',
      });
      setTimeout(() => setShowAlert(null), 5000);
    } finally {
      event.target.value = '';
    }
  };

  const saveEditedTranslation = () => {
    if (!editingTranslation) return;

    const nextTranslations = [...(watchedValues.translations || [])];
    if (editingTranslation.index < 0 || editingTranslation.index >= nextTranslations.length) {
      setShowAlert({ type: 'danger', message: 'Unable to save translation: invalid target row.' });
      setTimeout(() => setShowAlert(null), 4000);
      return;
    }

    const existingIndexForKey = nextTranslations.findIndex(
      (item, idx) => item.key === editingTranslation.key && idx !== editingTranslation.index
    );
    if (existingIndexForKey >= 0) {
      setShowAlert({ type: 'danger', message: 'Translation key must be unique.' });
      setTimeout(() => setShowAlert(null), 4000);
      return;
    }

    nextTranslations[editingTranslation.index] = {
      key: editingTranslation.key,
      category: editingTranslation.category,
      english: editingTranslation.english,
      translations: editingTranslation.translations || {},
      description: editingTranslation.description || '',
      context: editingTranslation.context || '',
    };

    replaceTranslations(nextTranslations);
    setValue('translations', nextTranslations, { shouldDirty: true, shouldValidate: true });
    setShowEditModal(false);
    setEditingTranslation(null);
  };

  if (error && !settingsData) {
    return (
      <>
        <PageTitle
          title="Translation Management"
          subName="Manage multi-language translations for the application"
        />
        <Card>
          <Card.Body>
            <Alert variant="danger" className="mb-0">
              <IconifyIcon icon="material-symbols:error" className="me-2" />
              Failed to load translation settings. Fix the backend connection and reload this page before making changes.
            </Alert>
          </Card.Body>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageTitle 
        title="Translation Management" 
        subName="Manage multi-language translations for the application"
      />

      {!isLoading && !hasStoredSettings && (
        <Alert variant="info" className="d-flex align-items-center">
          <IconifyIcon icon="material-symbols:info" className="me-2" />
          No saved translation settings were found yet. You are editing the platform defaults for first-time setup.
        </Alert>
      )}

      {showAlert && (
        <Alert variant={showAlert.type === 'info' ? 'info' : showAlert.type} className="d-flex align-items-center">
          <IconifyIcon icon={showAlert.type === 'success' ? 'material-symbols:check' : showAlert.type === 'info' ? 'material-symbols:info' : 'material-symbols:error'} className="me-2" />
          {showAlert.message}
        </Alert>
      )}

      <Row>
        <Col xs={12}>
          <ComponentContainerCard id="translation-config" title="Translation Configuration">
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted mb-0">Loading translation settings...</p>
              </div>
            ) : (
            <>
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k || 'translations')}
              className="mb-4"
            >
              <Tab eventKey="translations" title="Translations">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>Translation Keys</h5>
                  <div className="d-flex gap-2">
                    <input
                      ref={importInputRef}
                      type="file"
                      accept="application/json,.json"
                      className="d-none"
                      onChange={handleImportTranslations}
                    />
                    <Button variant="outline-success" onClick={exportTranslations}>
                      <IconifyIcon icon="material-symbols:download" className="me-2" />
                      Export
                    </Button>
                    <Button
                      variant="outline-primary"
                      onClick={() => importInputRef.current?.click()}
                    >
                      <IconifyIcon icon="material-symbols:upload" className="me-2" />
                      Import
                    </Button>
                    <Button variant="primary" onClick={addNewTranslation}>
                      <IconifyIcon icon="material-symbols:add" className="me-2" />
                      Add Translation
                    </Button>
                  </div>
                </div>

                {/* Filters */}
                <Row className="mb-4">
                  <Col md={4}>
                    <div className="position-relative">
                      <IconifyIcon icon="material-symbols:search" className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
                      <Form.Control
                        type="text"
                        placeholder="Search translations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="ps-4"
                      />
                    </div>
                  </Col>
                  <Col md={3}>
                    <Form.Select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="all">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Form.Select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                    >
                      <option value="all">All Languages</option>
                      <option value="missing">Missing Translations</option>
                      {availableLanguages.map(lang => (
                        <option key={lang.value} value={lang.value}>
                          {lang.flag} {lang.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={2}>
                    <div className="text-muted small">
                      {filteredTranslations.length} of {watchedValues.translations?.length || 0} keys
                    </div>
                  </Col>
                </Row>

                {/* Translations Table */}
                <Card>
                  <div className="table-responsive">
                    <Table className="mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Key</th>
                          <th>Category</th>
                          <th>English</th>
                          <th>Translations</th>
                          <th>Completion</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTranslations.map(({ translation, index: actualIndex }) => {
                          const completed = Object.keys(translation.translations || {}).length;
                          const total = watchedValues.activeLanguages?.length || 0;
                          const completion = total > 0 ? Math.round((completed / total) * 100) : 0;
                          
                          return (
                            <tr key={`${translation.key}-${actualIndex}`}>
                              <td>
                                <code className="small">{translation.key}</code>
                              </td>
                              <td>
                                <Badge bg="secondary">{translation.category}</Badge>
                              </td>
                              <td className="text-truncate" style={{ maxWidth: '200px' }}>
                                {translation.english}
                              </td>
                              <td>
                                <div className="d-flex flex-wrap gap-1">
                                  {watchedValues.activeLanguages?.map(langCode => {
                                    const lang = availableLanguages.find(l => l.value === langCode);
                                    const hasTranslation = translation.translations[langCode];
                                    return (
                                      <span
                                        key={langCode}
                                        className={`badge ${hasTranslation ? 'bg-success' : 'bg-light text-dark'}`}
                                        title={hasTranslation ? translation.translations[langCode] : 'Missing translation'}
                                      >
                                        {lang?.flag}
                                      </span>
                                    );
                                  })}
                                </div>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <ProgressBar 
                                    now={completion} 
                                    className="flex-grow-1 me-2"
                                    style={{ height: '6px' }}
                                    variant={completion === 100 ? 'success' : completion > 50 ? 'warning' : 'danger'}
                                  />
                                  <small className="text-muted">{completion}%</small>
                                </div>
                              </td>
                              <td>
                                <div className="d-flex gap-1">
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => editTranslation(translation, actualIndex)}
                                  >
                                    <IconifyIcon icon="material-symbols:edit" />
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => removeTranslation(actualIndex)}
                                  >
                                    <IconifyIcon icon="material-symbols:delete" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                </Card>
              </Tab>

              <Tab eventKey="languages" title="Languages">
                <Card>
                  <Card.Header className="d-flex align-items-center">
                    <IconifyIcon icon="material-symbols:language" className="me-2" />
                    <h6 className="mb-0">Active Languages</h6>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      {availableLanguages.map(lang => {
                        const isActive = watchedValues.activeLanguages?.includes(lang.value);
                        const completion = getTranslationCompletion(lang.value);
                        
                        return (
                          <Col md={6} lg={4} key={lang.value} className="mb-3">
                            <Card className={`h-100 ${isActive ? 'border-primary' : ''}`}>
                              <Card.Body className="text-center">
                                <div className="mb-2" style={{ fontSize: '2rem' }}>
                                  {lang.flag}
                                </div>
                                <h6>{lang.label}</h6>
                                <div className="mb-2">
                                  <ProgressBar 
                                    now={completion} 
                                    label={`${completion}%`}
                                    variant={completion === 100 ? 'success' : completion > 50 ? 'warning' : 'danger'}
                                  />
                                </div>
                                <Form.Check
                                  type="switch"
                                  id={`lang-${lang.value}`}
                                  label="Active"
                                  checked={isActive}
                                  onChange={(e) => {
                                    const currentLangs = watchedValues.activeLanguages || [];
                                    if (e.target.checked) {
                                      setValue('activeLanguages', [...currentLangs, lang.value]);
                                    } else {
                                      setValue('activeLanguages', currentLangs.filter(l => l !== lang.value));
                                    }
                                  }}
                                />
                              </Card.Body>
                            </Card>
                          </Col>
                        );
                      })}
                    </Row>
                  </Card.Body>
                </Card>
              </Tab>

              <Tab eventKey="settings" title="Settings">
                <Form onSubmit={handleSubmit(onSubmit)}>
                  <Row>
                    <Col lg={6}>
                      <Card className="mb-4">
                        <Card.Header className="d-flex align-items-center">
                          <IconifyIcon icon="material-symbols:settings" className="me-2" />
                          <h6 className="mb-0">Translation Mode</h6>
                        </Card.Header>
                        <Card.Body>
                          <SelectFormInput
                            control={control}
                            name="translationMode"
                            label="Translation Mode"
                            containerClassName="mb-3"
                            options={translationModes}
                          />

                          {(watchedValues.translationMode === 'auto' || watchedValues.translationMode === 'hybrid') && (
                            <SelectFormInput
                              control={control}
                              name="autoTranslateApi"
                              label="Auto-Translation API"
                              containerClassName="mb-3"
                              options={[
                                { value: '', label: 'Select API' },
                                ...autoTranslateApis
                              ]}
                            />
                          )}

                          <div className="mb-3">
                            <Form.Check
                              type="checkbox"
                              id="fallbackToEnglish"
                              label="Fallback to English for missing translations"
                              {...register('fallbackToEnglish')}
                            />
                          </div>

                          <div className="mb-3">
                            <Form.Check
                              type="checkbox"
                              id="showMissingKeys"
                              label="Show missing translation keys in UI"
                              {...register('showMissingKeys')}
                            />
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col lg={6}>
                      <Card className="mb-4">
                        <Card.Header className="d-flex align-items-center">
                          <IconifyIcon icon="material-symbols:code" className="me-2" />
                          <h6 className="mb-0">Translation Statistics</h6>
                        </Card.Header>
                        <Card.Body>
                          <div className="mb-3">
                            <div className="d-flex justify-content-between">
                              <span>Total Translation Keys:</span>
                              <Badge bg="primary">{watchedValues.translations?.length || 0}</Badge>
                            </div>
                          </div>
                          <div className="mb-3">
                            <div className="d-flex justify-content-between">
                              <span>Active Languages:</span>
                              <Badge bg="success">{watchedValues.activeLanguages?.length || 0}</Badge>
                            </div>
                          </div>
                          <div className="mb-3">
                            <div className="d-flex justify-content-between">
                              <span>Categories:</span>
                              <Badge bg="info">{translationCategoryCount}</Badge>
                            </div>
                          </div>
                          <hr />
                          <h6>Completion by Language:</h6>
                          {watchedValues.activeLanguages?.map(langCode => {
                            const lang = availableLanguages.find(l => l.value === langCode);
                            const completion = getTranslationCompletion(langCode);
                            return (
                              <div key={langCode} className="d-flex justify-content-between align-items-center mb-2">
                                <span>{lang?.flag} {lang?.label}:</span>
                                <div className="d-flex align-items-center">
                                  <ProgressBar 
                                    now={completion} 
                                    className="me-2"
                                    style={{ width: '60px', height: '6px' }}
                                    variant={completion === 100 ? 'success' : completion > 50 ? 'warning' : 'danger'}
                                  />
                                  <small>{completion}%</small>
                                </div>
                              </div>
                            );
                          })}
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Form>
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
                    Save Translation Settings
                  </>
                )}
              </Button>
            </div>
            </>
            )}
          </ComponentContainerCard>
        </Col>
      </Row>

      {/* Edit Translation Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Translation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingTranslation && (
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Translation Key</Form.Label>
                    <Form.Control
                      type="text"
                      value={editingTranslation.key}
                      readOnly
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Select
                      value={editingTranslation.category}
                      onChange={(e) => setEditingTranslation({
                        ...editingTranslation,
                        category: e.target.value
                      })}
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>English Text</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={editingTranslation.english}
                      onChange={(e) => setEditingTranslation({
                        ...editingTranslation,
                        english: e.target.value
                      })}
                    />
                  </Form.Group>
                </Col>
                <Col xs={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      type="text"
                      value={editingTranslation.description || ''}
                      onChange={(e) => setEditingTranslation({
                        ...editingTranslation,
                        description: e.target.value
                      })}
                    />
                  </Form.Group>
                </Col>
                <Col xs={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Context</Form.Label>
                    <Form.Control
                      type="text"
                      value={editingTranslation.context || ''}
                      onChange={(e) => setEditingTranslation({
                        ...editingTranslation,
                        context: e.target.value
                      })}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <h6 className="mt-4 mb-3">Translations</h6>
              {watchedValues.activeLanguages?.map(langCode => {
                const lang = availableLanguages.find(l => l.value === langCode);
                if (langCode === 'en') return null;
                
                return (
                  <div key={langCode} className="mb-3">
                    <label className="form-label">
                      {lang?.flag} {lang?.label}
                    </label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={editingTranslation.translations[langCode] || ''}
                      placeholder={`Enter ${lang?.label} translation...`}
                      onChange={(e) => setEditingTranslation({
                        ...editingTranslation,
                        translations: {
                          ...editingTranslation.translations,
                          [langCode]: e.target.value
                        }
                      })}
                    />
                  </div>
                );
              })}
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={saveEditedTranslation}>
            Save Translation
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TranslationsPage;
