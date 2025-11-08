import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  useColorScheme,
  StyleSheet,
  Platform,
  Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeColor } from '../hooks/use-theme-color';
import { StatusBar } from 'expo-status-bar';
import {
  FileText,
  Upload,
  Download,
  Settings,
  HelpCircle,
  Info,
  CheckCircle,
  List,
  Trash2,
  Sun,
  Moon,
  Monitor,
  ArrowLeft,
  Save,
  Send
} from 'lucide-react-native';

import { ThemedView } from './themed-view';
import { ThemedText } from './themed-text';
import { HapticTab } from './form/haptic-tab';
import { ExternalLink } from './external-link';

export default function ODKDashboard() {
  const [showInfo, setShowInfo] = useState(false);
  const [activeView, setActiveView] = useState('home');
  const [selectedProject, setSelectedProject] = useState('Demo Project - demo.odk.org');
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [downloadedForms, setDownloadedForms] = useState([]);
  const [draftForms, setDraftForms] = useState([]);
  const [finalizedForms, setFinalizedForms] = useState([]);
  const [sentForms, setSentForms] = useState([]);
  const [activeForm, setActiveForm] = useState(null);
  const [formData, setFormData] = useState({});

  const systemColorScheme = useColorScheme();
  const isDark = theme === 'dark' || (theme === 'auto' && systemColorScheme === 'dark');
  const colors = useThemeColor();

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('odkTheme');
        if (savedTheme) {
          setTheme(savedTheme as 'light' | 'dark' | 'auto');
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };
    loadTheme();
  }, []);

  useEffect(() => {
    const saveTheme = async () => {
      try {
        await AsyncStorage.setItem('odkTheme', theme);
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    };
    saveTheme();
  }, [theme]);

  const serverForms = [
    {
      id: 'afp_case',
      name: 'Immediate AFP Case',
      description: 'Acute Flaccid Paralysis case investigation form',
      version: '2.1',
      lastUpdated: 'Oct 15, 2025',
      fields: [
        { id: 'patient_name', label: 'Patient Name', type: 'text', required: true },
        { id: 'age', label: 'Age', type: 'number', required: true },
        { id: 'date_onset', label: 'Date of Onset', type: 'date', required: true },
        { id: 'location', label: 'Location', type: 'text', required: true },
        { id: 'symptoms', label: 'Symptoms Description', type: 'textarea', required: true },
        { id: 'contact', label: 'Contact Number', type: 'tel', required: false }
      ]
    },
    {
      id: 'weekly_health',
      name: 'Weekly Health Facility Report',
      description: 'Weekly health data collection from facilities',
      version: '1.5',
      lastUpdated: 'Oct 12, 2025',
      fields: [
        { id: 'facility_name', label: 'Facility Name', type: 'text', required: true },
        { id: 'week_ending', label: 'Week Ending Date', type: 'date', required: true },
        { id: 'total_patients', label: 'Total Patients Seen', type: 'number', required: true },
        { id: 'immunizations', label: 'Immunizations Given', type: 'number', required: true },
        { id: 'diseases_reported', label: 'Diseases Reported', type: 'textarea', required: false },
        { id: 'staff_on_duty', label: 'Staff on Duty', type: 'number', required: true }
      ]
    },
    {
      id: 'routine_notification',
      name: 'Level Routine Weekly Notification',
      description: 'Routine weekly notification for surveillance',
      version: '3.0',
      lastUpdated: 'Oct 10, 2025',
      fields: [
        { id: 'reporting_level', label: 'Reporting Level', type: 'text', required: true },
        { id: 'week_number', label: 'Week Number', type: 'number', required: true },
        { id: 'year', label: 'Year', type: 'number', required: true },
        { id: 'cases_detected', label: 'Cases Detected', type: 'number', required: true },
        { id: 'deaths_reported', label: 'Deaths Reported', type: 'number', required: true },
        { id: 'notes', label: 'Additional Notes', type: 'textarea', required: false }
      ]
    }
  ];

  const menuItems = [
    { icon: FileText, label: 'Fill Blank Form', count: downloadedForms.length, color: 'bg-blue-500', id: 'fill' },
    { icon: CheckCircle, label: 'Edit Saved Form', count: draftForms.length, color: 'bg-green-500', id: 'edit' },
    { icon: Upload, label: 'Send Finalized Form', count: finalizedForms.length, color: 'bg-purple-500', id: 'send' },
    { icon: List, label: 'View Sent Form', count: sentForms.length, color: 'bg-teal-500', id: 'view' },
    { icon: Download, label: 'Get Blank Form', count: null, color: 'bg-orange-500', id: 'get' },
    { icon: Trash2, label: 'Delete Saved Form', count: null, color: 'bg-red-500', id: 'delete' },
  ];

  const themes = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'auto', icon: Monitor, label: 'Auto' }
  ];

  const handleDownloadForm = (form) => {
    if (!downloadedForms.find(f => f.id === form.id)) {
      setDownloadedForms([...downloadedForms, form]);
      alert(`${form.name} downloaded successfully!`);
    } else {
      alert(`${form.name} is already downloaded.`);
    }
  };

  const handleOpenForm = (form, existingData = null, isDraft = false) => {
    setActiveForm({ ...form, isDraft, draftId: existingData?.draftId });
    setFormData(existingData?.data || {});
    setActiveView('form_entry');
  };

  const handleInputChange = (fieldId, value) => {
    setFormData({ ...formData, [fieldId]: value });
  };

  const handleSaveDraft = () => {
    const draftId = activeForm.draftId || `draft_${Date.now()}`;
    const draft = {
      draftId,
      form: activeForm,
      data: formData,
      savedDate: new Date().toLocaleDateString()
    };
    
    const existingIndex = draftForms.findIndex(d => d.draftId === draftId);
    if (existingIndex >= 0) {
      const updated = [...draftForms];
      updated[existingIndex] = draft;
      setDraftForms(updated);
    } else {
      setDraftForms([...draftForms, draft]);
    }
    
    alert('Form saved as draft!');
    setActiveView('home');
    setActiveForm(null);
    setFormData({});
  };

  const handleFinalize = () => {
    const requiredFields = activeForm.fields.filter(f => f.required);
    const missingFields = requiredFields.filter(f => !formData[f.id]);
    
    if (missingFields.length > 0) {
      alert(`Please fill all required fields: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    const finalized = {
      id: `final_${Date.now()}`,
      form: activeForm,
      data: formData,
      finalizedDate: new Date().toLocaleDateString()
    };
    
    setFinalizedForms([...finalizedForms, finalized]);
    
    if (activeForm.draftId) {
      setDraftForms(draftForms.filter(d => d.draftId !== activeForm.draftId));
    }
    
    alert('Form finalized successfully!');
    setActiveView('home');
    setActiveForm(null);
    setFormData({});
  };

  const handleSendForms = () => {
    if (finalizedForms.length === 0) {
      alert('No finalized forms to send!');
      return;
    }

    const sent = finalizedForms.map(f => ({
      ...f,
      sentDate: new Date().toLocaleDateString(),
      status: 'uploaded'
    }));
    
    setSentForms([...sentForms, ...sent]);
    setFinalizedForms([]);
    alert(`${sent.length} form(s) sent successfully!`);
    setActiveView('home');
  };

  const handleProjectChange = () => {
    const projects = [
      'Demo Project - demo.odk.org',
      'Survey Project - survey.example.com',
      'Research Project - research.odk.org'
    ];
    const currentIndex = projects.indexOf(selectedProject);
    const nextIndex = (currentIndex + 1) % projects.length;
    setSelectedProject(projects[nextIndex]);
  };

  const renderContent = () => {
    if (activeView === 'form_entry') {
      return renderFormEntry();
    }

    if (activeView === 'home') {
      return renderHomeContent();
    }

    return (
      <ThemedView style={styles.card}>
        <TouchableOpacity
          onPress={() => setActiveView('home')}
          style={styles.backButton}
        >
          <ArrowLeft size={20} color={colors.blue} />
          <ThemedText style={[styles.backButtonText, { color: colors.blue }]}>
            Back to Home
          </ThemedText>
        </TouchableOpacity>

        <ThemedText style={styles.sectionTitle}>
          {menuItems.find(item => item.id === activeView)?.label || 'Get Help'}
        </ThemedText>

        <ScrollView style={styles.contentContainer}>
          {activeView === 'fill' && (
            <View style={styles.listContainer}>
              {downloadedForms.length === 0 ? (
                <ThemedText style={styles.emptyText}>
                  No forms available. Please download forms first from "Get Blank Form".
                </ThemedText>
              ) : (
                <>
                  <ThemedText style={styles.subtitle}>Select a form to fill:</ThemedText>
                  {downloadedForms.map((form, i) => (
                    <HapticTab
                      key={i}
                      onPress={() => handleOpenForm(form)}
                      style={styles.listItem}
                    >
                      <ThemedText style={styles.listItemTitle}>{form.name}</ThemedText>
                      <ThemedText style={styles.listItemDescription}>{form.description}</ThemedText>
                      <ThemedText style={styles.listItemMeta}>
                        Version {form.version} • Updated: {form.lastUpdated}
                      </ThemedText>
                    </HapticTab>
                  ))}
                </>
              )}
            </View>
          )}

          {activeView === 'help' && (
            <View style={styles.helpLinksContainer}>
              <ThemedText style={styles.subtitle}>
                Access documentation and support resources:
              </ThemedText>
              <View style={styles.helpLinks}>
                <ExternalLink
                  url="https://docs.getodk.org"
                  title="ODK Documentation"
                  description="Complete guides and tutorials"
                />
                <ExternalLink
                  url="https://forum.getodk.org"
                  title="Community Forum"
                  description="Get help from the community"
                />
              </View>
            </View>
          )}
        </ScrollView>
      </ThemedView>
    );
  };

  const renderFormEntry = () => {
    if (!activeForm) return null;

    return (
      <ThemedView style={styles.card}>
        <TouchableOpacity
          onPress={() => {
            setActiveView('home');
            setActiveForm(null);
            setFormData({});
          }}
          style={styles.backButton}
        >
          <ArrowLeft size={20} color={colors.blue} />
          <ThemedText style={[styles.backButtonText, { color: colors.blue }]}>Back</ThemedText>
        </TouchableOpacity>
        
        <ThemedText style={styles.title}>{activeForm.name}</ThemedText>
        <ThemedText style={styles.description}>{activeForm.description}</ThemedText>

        <ScrollView style={styles.formFields}>
          {activeForm.fields.map(field => (
            <View key={field.id} style={styles.fieldContainer}>
              <View style={styles.labelContainer}>
                <ThemedText style={styles.fieldLabel}>
                  {field.label}
                </ThemedText>
                {field.required && (
                  <Text style={styles.requiredStar}>*</Text>
                )}
              </View>
              <TextInput
                value={formData[field.id] || ''}
                onChangeText={(text) => handleInputChange(field.id, text)}
                style={[
                  styles.input,
                  { 
                    backgroundColor: isDark ? colors.gray800 : colors.white,
                    color: isDark ? colors.gray100 : colors.gray900,
                    borderColor: isDark ? colors.gray700 : colors.gray300,
                    height: field.type === 'textarea' ? 100 : 40
                  }
                ]}
                multiline={field.type === 'textarea'}
                keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                placeholder={`Enter ${field.label.toLowerCase()}`}
                placeholderTextColor={isDark ? colors.gray400 : colors.gray600}
              />
            </View>
          ))}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleSaveDraft}
            style={[styles.button, { backgroundColor: colors.gray600 }]}
          >
            <Save size={20} color="white" />
            <Text style={styles.buttonText}>Save as Draft</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleFinalize}
            style={[styles.button, { backgroundColor: colors.green600 }]}
          >
            <CheckCircle size={20} color="white" />
            <Text style={styles.buttonText}>Finalize</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  };

  const renderHomeContent = () => (
    <>
      <ThemedView style={styles.projectCard}>
        <View>
          <ThemedText style={styles.projectTitle}>Current Project</ThemedText>
          <ThemedText style={styles.projectSubtitle}>{selectedProject}</ThemedText>
        </View>
        <TouchableOpacity
          onPress={handleProjectChange}
          style={styles.changeButton}
        >
          <ThemedText style={styles.changeButtonText}>Change</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <View style={styles.menuGrid}>
        {menuItems.map((item, index) => (
          <HapticTab
            key={index}
            onPress={() => setActiveView(item.id)}
            style={[styles.menuItem, { backgroundColor: isDark ? colors.gray800 : colors.white }]}
          >
            <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
              <item.icon size={28} color="white" />
            </View>
            <View style={styles.menuTextContainer}>
              <ThemedText style={styles.menuTitle}>{item.label}</ThemedText>
              {item.count !== null && (
                <ThemedText style={styles.menuCount}>{item.count} available</ThemedText>
              )}
            </View>
          </HapticTab>
        ))}
      </View>

      <ThemedView style={styles.helpCard}>
        <HapticTab
          onPress={() => setActiveView('help')}
          style={styles.helpButton}
        >
          <View style={styles.helpIcon}>
            <HelpCircle size={24} color="white" />
          </View>
          <View>
            <ThemedText style={styles.helpTitle}>Get Help</ThemedText>
            <ThemedText style={styles.helpSubtitle}>Documentation and support</ThemedText>
          </View>
        </HapticTab>
      </ThemedView>
    </>
  );
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => setActiveView(item.id)}
                className={`${cardBgClass} rounded-lg shadow-sm hover:shadow-md active:shadow-lg transition-all p-6 flex items-center gap-4 text-left transform hover:scale-105 active:scale-100`}
              >
                <div className={`${item.color} p-4 rounded-full text-white`}>
                  <item.icon size={28} />
                </div>
                <div className="flex-1">
                  <h3 className={`${textPrimaryClass} font-medium text-lg`}>{item.label}</h3>
                  {item.count !== null && (
                    <p className={`${textSecondaryClass} text-sm mt-1`}>{item.count} available</p>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className={`mt-6 ${cardBgClass} rounded-lg shadow-sm p-4`}>
            <button 
              onClick={() => setActiveView('help')}
              className={`w-full flex items-center gap-3 text-left ${hoverBgClass} ${activeBgClass} p-2 rounded transition-colors`}
            >
              <div className="bg-gray-500 p-3 rounded-full text-white">
                <HelpCircle size={24} />
              </div>
              <div>
                <h3 className={`${textPrimaryClass} font-medium`}>Get Help</h3>
                <p className={`${textSecondaryClass} text-sm`}>Documentation and support</p>
              </div>
            </button>
          </div>
        </>
      );
    }

    return (
      <div className={`${cardBgClass} rounded-lg shadow-sm p-6`}>
        <button
          onClick={() => setActiveView('home')}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
        >
          <ArrowLeft size={20} /> Back to Home
        </button>
        <h2 className={`text-2xl font-bold ${textPrimaryClass} mb-4`}>
          {menuItems.find(item => item.id === activeView)?.label || 'Get Help'}
        </h2>
        <div className="space-y-4">
          {activeView === 'fill' && (
            <div className="space-y-3">
              {downloadedForms.length === 0 ? (
                <p className={`${textSecondaryClass} text-center py-8`}>
                  No forms available. Please download forms first from "Get Blank Form".
                </p>
              ) : (
                <>
                  <p className={`${textSecondaryClass} mb-4`}>Select a form to fill:</p>
                  {downloadedForms.map((form, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleOpenForm(form)}
                      className={`w-full text-left p-4 border ${borderClass} rounded-lg ${hoverBgClass} ${activeBgClass} transition-colors`}
                    >
                      <div className={`font-medium ${textPrimaryClass} text-lg`}>{form.name}</div>
                      <div className={`text-sm ${textSecondaryClass} mt-1`}>{form.description}</div>
                      <div className={`text-xs ${textSecondaryClass} mt-2 flex items-center gap-3`}>
                        <span>Version {form.version}</span>
                        <span>•</span>
                        <span>Updated: {form.lastUpdated}</span>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
          
          {activeView === 'edit' && (
            <div className="space-y-3">
              {draftForms.length === 0 ? (
                <p className={`${textSecondaryClass} text-center py-8`}>No draft forms available.</p>
              ) : (
                <>
                  <p className={`${textSecondaryClass} mb-4`}>Saved forms you can edit:</p>
                  {draftForms.map((draft, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleOpenForm(draft.form, draft, true)}
                      className={`w-full text-left p-4 border ${borderClass} rounded-lg ${hoverBgClass} ${activeBgClass} transition-colors`}
                    >
                      <div className={`font-medium ${textPrimaryClass}`}>{draft.form.name} - Draft</div>
                      <div className={`text-sm ${textSecondaryClass} mt-1`}>{draft.form.description}</div>
                      <div className={`text-xs ${textSecondaryClass} mt-2`}>Saved: {draft.savedDate}</div>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
          
          {activeView === 'send' && (
            <div className="space-y-4">
              {finalizedForms.length === 0 ? (
                <p className={`${textSecondaryClass} text-center py-8`}>No finalized forms to send.</p>
              ) : (
                <>
                  <p className={textSecondaryClass}>{finalizedForms.length} form(s) ready to send to server</p>
                  <div className="space-y-3 mb-4">
                    {finalizedForms.map((final, i) => (
                      <div key={i} className={`p-4 border ${borderClass} rounded-lg`}>
                        <div className={`font-medium ${textPrimaryClass}`}>{final.form.name}</div>
                        <div className={`text-sm ${textSecondaryClass}`}>Finalized: {final.finalizedDate}</div>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={handleSendForms}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 active:bg-purple-800 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Send size={20} /> Send All Forms
                  </button>
                </>
              )}
            </div>
          )}
          
          {activeView === 'view' && (
            <div className="space-y-3">
              {sentForms.length === 0 ? (
                <p className={`${textSecondaryClass} text-center py-8`}>No sent forms yet.</p>
              ) : (
                <>
                  <p className={`${textSecondaryClass} mb-4`}>Previously sent forms:</p>
                  {sentForms.map((sent, i) => (
                    <div key={i} className={`p-4 border ${borderClass} rounded-lg`}>
                      <div className={`font-medium ${textPrimaryClass}`}>{sent.form.name}</div>
                      <div className={`text-sm ${textSecondaryClass} mt-1`}>Sent: {sent.sentDate}</div>
                      <div className="text-xs text-green-600 mt-2">✓ Successfully uploaded</div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
          
          {activeView === 'get' && (
            <div className="space-y-4">
              <p className={`${textSecondaryClass} mb-4`}>Available forms on server:</p>
              <div className={`text-sm ${textSecondaryClass} mb-4 text-center`}>Connected to: {selectedProject}</div>
              
              <div className="space-y-3 mb-4">
                {serverForms.map((form, i) => (
                  <div key={i} className={`p-4 border ${borderClass} rounded-lg`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className={`font-medium ${textPrimaryClass}`}>{form.name}</div>
                        <div className={`text-sm ${textSecondaryClass} mt-1`}>{form.description}</div>
                        <div className={`text-xs ${textSecondaryClass} mt-2`}>
                          Version {form.version} • {form.lastUpdated}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDownloadForm(form)}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 active:bg-orange-800 transition-colors text-sm font-medium whitespace-nowrap"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeView === 'delete' && (
            <div className="space-y-4">
              <p className={`${textSecondaryClass} mb-4`}>Select forms to delete:</p>
              <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
                ⚠️ Warning: Deleted forms cannot be recovered
              </div>
              {(draftForms.length === 0 && finalizedForms.length === 0) ? (
                <p className={`${textSecondaryClass} text-center py-8`}>No forms to delete.</p>
              ) : (
                <div className="space-y-3">
                  {draftForms.map((draft, i) => (
                    <div key={i} className={`p-4 border ${borderClass} rounded-lg flex justify-between items-center`}>
                      <div>
                        <div className={`font-medium ${textPrimaryClass}`}>{draft.form.name} - Draft</div>
                        <div className={`text-sm ${textSecondaryClass}`}>Saved: {draft.savedDate}</div>
                      </div>
                      <button 
                        onClick={() => {
                          setDraftForms(draftForms.filter((_, index) => index !== i));
                          alert('Draft deleted');
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                  {finalizedForms.map((final, i) => (
                    <div key={i} className={`p-4 border ${borderClass} rounded-lg flex justify-between items-center`}>
                      <div>
                        <div className={`font-medium ${textPrimaryClass}`}>{final.form.name} - Finalized</div>
                        <div className={`text-sm ${textSecondaryClass}`}>Finalized: {final.finalizedDate}</div>
                      </div>
                      <button 
                        onClick={() => {
                          setFinalizedForms(finalizedForms.filter((_, index) => index !== i));
                          alert('Finalized form deleted');
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeView === 'help' && (
            <div className="space-y-4">
              <p className={textSecondaryClass}>Access documentation and support resources:</p>
              <div className="space-y-3">
                <a href="https://docs.getodk.org" target="_blank" rel="noopener noreferrer" className={`block p-4 border ${borderClass} rounded-lg ${hoverBgClass} ${activeBgClass} transition-colors`}>
                  <div className="font-medium text-blue-600">ODK Documentation</div>
                  <div className={`text-sm ${textSecondaryClass}`}>Complete guides and tutorials</div>
                </a>
                <a href="https://forum.getodk.org" target="_blank" rel="noopener noreferrer" className={`block p-4 border ${borderClass} rounded-lg ${hoverBgClass} ${activeBgClass} transition-colors`}>
                  <div className="font-medium text-blue-600">Community Forum</div>
                  <div className={`text-sm ${textSecondaryClass}`}>Get help from the community</div>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={[styles.header, { backgroundColor: colors.blue600 }]}>
        <TouchableOpacity
          onPress={() => setActiveView('home')}
          style={styles.headerTitle}
        >
          <Text style={styles.headerText}>ODK Collect</Text>
        </TouchableOpacity>
        
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={() => setShowInfo(!showInfo)}
            style={styles.headerButton}
          >
            <Info size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveView('settings')}
            style={styles.headerButton}
          >
            <Settings size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {showInfo && (
        <View style={[styles.infoBar, { backgroundColor: colors.blue50 }]}>
          <Text style={[styles.infoText, { color: colors.blue800 }]}>
            <Text style={styles.infoBold}>ODK Collect v2024.1</Text>
            {' '}- Open Data Kit for data collection
          </Text>
          <TouchableOpacity onPress={() => setShowInfo(false)}>
            <Text style={[styles.infoClose, { color: colors.blue800 }]}>×</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        {activeView === 'settings' ? (
          <ThemedView style={styles.card}>
            <TouchableOpacity
              onPress={() => setActiveView('home')}
              style={styles.backButton}
            >
              <ArrowLeft size={20} color={colors.blue} />
              <ThemedText style={[styles.backButtonText, { color: colors.blue }]}>
                Back to Home
              </ThemedText>
            </TouchableOpacity>

            <ThemedText style={styles.title}>Settings</ThemedText>
            
            <View style={styles.settingsSection}>
              <ThemedText style={styles.settingsSectionTitle}>Appearance</ThemedText>
              <View style={styles.themeGrid}>
                {themes.map((t) => (
                  <TouchableOpacity
                    key={t.value}
                    onPress={() => setTheme(t.value as 'light' | 'dark' | 'auto')}
                    style={[
                      styles.themeButton,
                      {
                        borderColor: theme === t.value ? colors.blue600 : isDark ? colors.gray700 : colors.gray300,
                        backgroundColor: theme === t.value
                          ? isDark ? colors.blue900 : colors.blue50
                          : 'transparent'
                      }
                    ]}
                  >
                    <t.icon
                      size={24}
                      color={theme === t.value ? colors.blue600 : isDark ? colors.gray400 : colors.gray600}
                    />
                    <ThemedText
                      style={[
                        styles.themeButtonText,
                        { color: theme === t.value ? colors.blue600 : undefined }
                      ]}
                    >
                      {t.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.settingsList}>
              {['Server Settings', 'User Interface', 'Form Management', 'User and Device Identity'].map((setting, i) => (
                <HapticTab
                  key={i}
                  style={styles.settingsItem}
                  onPress={() => {}}
                >
                  <ThemedText style={styles.settingsItemText}>{setting}</ThemedText>
                </HapticTab>
              ))}
            </View>
          </ThemedView>
        ) : (
          renderContent()
        )}

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>Powered by Open Data Kit</ThemedText>
          <ThemedText style={styles.footerVersion}>Version 2024.1.0</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  headerButtons: {
    flexDirection: 'row',
    position: 'absolute',
    right: 16,
    top: 16,
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  infoBar: {
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
  },
  infoBold: {
    fontWeight: '600',
  },
  infoClose: {
    fontSize: 24,
    fontWeight: '600',
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    marginBottom: 24,
    opacity: 0.7,
  },
  projectCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  projectSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  changeButton: {
    padding: 8,
  },
  changeButtonText: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  menuItem: {
    width: '50%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  menuIcon: {
    padding: 12,
    borderRadius: 50,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  menuCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  helpCard: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  helpIcon: {
    backgroundColor: '#6B7280',
    padding: 12,
    borderRadius: 50,
    marginRight: 12,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  helpSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  formFields: {
    flex: 1,
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  requiredStar: {
    color: '#EF4444',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  contentContainer: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    padding: 32,
    opacity: 0.7,
  },
  subtitle: {
    marginBottom: 16,
    opacity: 0.7,
  },
  listItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  listItemDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  listItemMeta: {
    fontSize: 12,
    opacity: 0.5,
  },
  helpLinksContainer: {
    flex: 1,
  },
  helpLinks: {
    gap: 12,
  },
  settingsSection: {
    marginBottom: 24,
  },
  settingsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  themeGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  themeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  themeButtonText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  settingsList: {
    gap: 12,
  },
  settingsItem: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  settingsItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  footerText: {
    fontSize: 14,
    opacity: 0.7,
  },
  footerVersion: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
});
                ))}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {['Server Settings', 'User Interface', 'Form Management', 'User and Device Identity'].map((setting, i) => (
                <button key={i} className={`w-full text-left p-4 border ${borderClass} rounded-lg ${hoverBgClass} ${activeBgClass} transition-colors`}>
                  <div className={`font-medium ${textPrimaryClass}`}>{setting}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          renderContent()
        )}

        <div className={`mt-8 text-center ${textSecondaryClass} text-sm pb-4`}>
          <p>Powered by Open Data Kit</p>
          <p className="mt-1">Version 2024.1.0</p>
        </div>
      </div>
    </div>
  );
}