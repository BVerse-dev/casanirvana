import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MyStatusBar from '../components/myStatusBar';
import { Colors, Default, Fonts } from '../constants/styles';

const OpenSourceLicensesScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  const [selectedLicense, setSelectedLicense] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const openSourceLibraries = [
    {
      id: 1,
      name: "React Native",
      version: "0.72.6",
      license: "MIT License",
      author: "Meta Platforms, Inc.",
      description: "A framework for building native mobile apps using React",
      repository: "https://github.com/facebook/react-native",
      licenseText: `MIT License\n\nCopyright (c) Meta Platforms, Inc. and affiliates.\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`
    },
    {
      id: 2,
      name: "React",
      version: "18.2.0",
      license: "MIT License",
      author: "Meta Platforms, Inc.",
      description: "A JavaScript library for building user interfaces",
      repository: "https://github.com/facebook/react",
      licenseText: `MIT License\n\nCopyright (c) Meta Platforms, Inc. and affiliates.\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`
    },
    {
      id: 3,
      name: "Expo",
      version: "49.0.15",
      license: "MIT License",
      author: "Expo Team",
      description: "Platform for universal React applications",
      repository: "https://github.com/expo/expo",
      licenseText: `MIT License\n\nCopyright (c) 2015-present 650 Industries, Inc. (aka Expo)\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`
    },
    {
      id: 4,
      name: "React Navigation",
      version: "6.1.9",
      license: "MIT License",
      author: "React Navigation Contributors",
      description: "Routing and navigation for React Native apps",
      repository: "https://github.com/react-navigation/react-navigation",
      licenseText: `MIT License\n\nCopyright (c) 2017 React Navigation Contributors\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`
    },
    {
      id: 5,
      name: "Supabase JS",
      version: "2.38.0",
      license: "MIT License",
      author: "Supabase Inc.",
      description: "JavaScript client library for Supabase",
      repository: "https://github.com/supabase/supabase-js",
      licenseText: `MIT License\n\nCopyright (c) 2020 Supabase Inc.\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`
    },
    {
      id: 6,
      name: "React Native Vector Icons",
      version: "10.0.0",
      license: "MIT License",
      author: "Joel Arvidsson",
      description: "Customizable Icons for React Native",
      repository: "https://github.com/oblador/react-native-vector-icons",
      licenseText: `MIT License\n\nCopyright (c) 2015 Joel Arvidsson\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`
    },
    {
      id: 7,
      name: "React i18next",
      version: "13.5.0",
      license: "MIT License",
      author: "i18next Community",
      description: "Internationalization framework for React",
      repository: "https://github.com/i18next/react-i18next",
      licenseText: `MIT License\n\nCopyright (c) 2017 i18next\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`
    },
    {
      id: 8,
      name: "React Query",
      version: "4.36.1",
      license: "MIT License",
      author: "Tanner Linsley",
      description: "Data fetching library for React applications",
      repository: "https://github.com/TanStack/query",
      licenseText: `MIT License\n\nCopyright (c) 2021 Tanner Linsley\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`
    },
    {
      id: 9,
      name: "React Native Gesture Handler",
      version: "2.12.1",
      license: "MIT License",
      author: "Software Mansion",
      description: "Declarative API exposing platform native touch and gesture system",
      repository: "https://github.com/software-mansion/react-native-gesture-handler",
      licenseText: `MIT License\n\nCopyright (c) 2016 Software Mansion <swmansion.com>\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`
    },
    {
      id: 10,
      name: "React Native Reanimated",
      version: "3.5.4",
      license: "MIT License",
      author: "Software Mansion",
      description: "React Native's Animated library reimplemented",
      repository: "https://github.com/software-mansion/react-native-reanimated",
      licenseText: `MIT License\n\nCopyright (c) 2016 Software Mansion <swmansion.com>\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`
    }
  ];

  const showLicenseDetails = (library) => {
    setSelectedLicense(library);
    setModalVisible(true);
  };

  const handleExportLicenses = () => {
    Alert.alert('Export Licenses', 'License information will be exported to a file.');
  };

  const LibraryCard = ({ library }) => (
    <TouchableOpacity 
      style={styles.libraryCard} 
      onPress={() => showLicenseDetails(library)}
    >
      <View style={styles.libraryHeader}>
        <View style={styles.libraryIcon}>
          <MaterialCommunityIcons name="code-braces" size={24} color={Colors.primary} />
        </View>
        <View style={styles.libraryInfo}>
          <Text style={styles.libraryName}>{library.name}</Text>
          <Text style={styles.libraryVersion}>v{library.version}</Text>
          <Text style={styles.libraryAuthor}>by {library.author}</Text>
        </View>
        <View style={styles.libraryMeta}>
          <View style={styles.licenseTag}>
            <Text style={styles.licenseTagText}>{library.license}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.libraryDescription}>{library.description}</Text>
      <View style={styles.libraryFooter}>
        <MaterialCommunityIcons name="github" size={16} color={Colors.grey} />
        <Text style={styles.repositoryText}>View Repository</Text>
        <Ionicons name="chevron-forward" size={16} color={Colors.grey} style={styles.chevron} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <MyStatusBar />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons
            name={isRtl ? 'arrow-forward-outline' : 'arrow-back-outline'}
            size={25}
            color={Colors.black}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Open Source Licenses</Text>
        <TouchableOpacity onPress={handleExportLicenses} style={styles.exportButton}>
          <MaterialCommunityIcons name="export" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <MaterialCommunityIcons name="heart" size={40} color={Colors.red} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Open Source Attributions</Text>
              <Text style={styles.infoSubtitle}>
                Casa Nirvana Guard app is built with love using these amazing open source projects
              </Text>
            </View>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{openSourceLibraries.length}</Text>
              <Text style={styles.statLabel}>Libraries</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>10</Text>
              <Text style={styles.statLabel}>MIT Licenses</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>100%</Text>
              <Text style={styles.statLabel}>Free & Open</Text>
            </View>
          </View>
        </View>

        {/* Libraries List */}
        <View style={styles.librariesSection}>
          <Text style={styles.sectionTitle}>Third-Party Libraries</Text>
          {openSourceLibraries.map((library) => (
            <LibraryCard key={library.id} library={library} />
          ))}
        </View>

        {/* Attribution Footer */}
        <View style={styles.attributionFooter}>
          <MaterialCommunityIcons name="information" size={20} color={Colors.primary} />
          <Text style={styles.attributionText}>
            We are grateful to the open source community for making these tools available. 
            All libraries are used in accordance with their respective licenses.
          </Text>
        </View>
      </ScrollView>

      {/* License Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedLicense?.name}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.black} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.modalInfo}>
                <Text style={styles.modalLabel}>Version:</Text>
                <Text style={styles.modalValue}>{selectedLicense?.version}</Text>
              </View>
              <View style={styles.modalInfo}>
                <Text style={styles.modalLabel}>License:</Text>
                <Text style={styles.modalValue}>{selectedLicense?.license}</Text>
              </View>
              <View style={styles.modalInfo}>
                <Text style={styles.modalLabel}>Author:</Text>
                <Text style={styles.modalValue}>{selectedLicense?.author}</Text>
              </View>
              <Text style={styles.licenseTitle}>License Text:</Text>
              <Text style={styles.licenseText}>{selectedLicense?.licenseText}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default OpenSourceLicensesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.extraLightGrey,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 1.2,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  backButton: {
    padding: Default.fixPadding * 0.5,
  },
  headerTitle: {
    ...Fonts.SemiBold18black,
    marginHorizontal: Default.fixPadding,
    flex: 1,
  },
  exportButton: {
    padding: Default.fixPadding * 0.5,
  },
  scrollView: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: Colors.white,
    margin: Default.fixPadding * 2,
    borderRadius: 15,
    padding: Default.fixPadding * 2,
    ...Default.shadow,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Default.fixPadding * 1.5,
  },
  infoContent: {
    flex: 1,
    marginLeft: Default.fixPadding,
  },
  infoTitle: {
    ...Fonts.SemiBold18black,
    marginBottom: Default.fixPadding * 0.3,
  },
  infoSubtitle: {
    ...Fonts.Medium14grey,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Default.fixPadding,
    borderTopWidth: 1,
    borderTopColor: Colors.extraLightGrey,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...Fonts.SemiBold18primary,
    marginBottom: Default.fixPadding * 0.3,
  },
  statLabel: {
    ...Fonts.Medium12grey,
  },
  librariesSection: {
    paddingHorizontal: Default.fixPadding * 2,
  },
  sectionTitle: {
    ...Fonts.SemiBold16black,
    color: Colors.primary,
    marginBottom: Default.fixPadding,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  libraryCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Default.fixPadding * 1.5,
    marginBottom: Default.fixPadding * 1.5,
    ...Default.shadow,
    elevation: 2,
  },
  libraryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Default.fixPadding,
  },
  libraryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Default.fixPadding,
  },
  libraryInfo: {
    flex: 1,
  },
  libraryName: {
    ...Fonts.SemiBold15black,
    marginBottom: Default.fixPadding * 0.2,
  },
  libraryVersion: {
    ...Fonts.Medium12primary,
    marginBottom: Default.fixPadding * 0.2,
  },
  libraryAuthor: {
    ...Fonts.Medium12grey,
  },
  libraryMeta: {
    alignItems: 'flex-end',
  },
  licenseTag: {
    backgroundColor: Colors.green + '15',
    paddingHorizontal: Default.fixPadding * 0.8,
    paddingVertical: Default.fixPadding * 0.3,
    borderRadius: 12,
  },
  licenseTagText: {
    ...Fonts.Medium10black,
    color: Colors.green,
    fontSize: 10,
  },
  libraryDescription: {
    ...Fonts.Medium14grey,
    lineHeight: 20,
    marginBottom: Default.fixPadding,
  },
  libraryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Default.fixPadding,
    borderTopWidth: 1,
    borderTopColor: Colors.extraLightGrey,
  },
  repositoryText: {
    ...Fonts.Medium12grey,
    marginLeft: Default.fixPadding * 0.5,
    flex: 1,
  },
  chevron: {
    marginLeft: Default.fixPadding,
  },
  attributionFooter: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.primary + '10',
    margin: Default.fixPadding * 2,
    padding: Default.fixPadding * 1.5,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  attributionText: {
    ...Fonts.Medium12black,
    flex: 1,
    marginLeft: Default.fixPadding,
    lineHeight: 18,
    color: Colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    margin: Default.fixPadding * 2,
    borderRadius: 15,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Default.fixPadding * 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.extraLightGrey,
  },
  modalTitle: {
    ...Fonts.SemiBold18black,
    flex: 1,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalInfo: {
    flexDirection: 'row',
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 0.5,
  },
  modalLabel: {
    ...Fonts.Medium14grey,
    width: 80,
  },
  modalValue: {
    ...Fonts.Medium14black,
    flex: 1,
  },
  licenseTitle: {
    ...Fonts.SemiBold16black,
    margin: Default.fixPadding * 2,
    marginBottom: Default.fixPadding,
  },
  licenseText: {
    ...Fonts.Medium12grey,
    paddingHorizontal: Default.fixPadding * 2,
    paddingBottom: Default.fixPadding * 2,
    lineHeight: 18,
    fontFamily: 'monospace',
  },
});
