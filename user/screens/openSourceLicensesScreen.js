import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MyStatusBar from "../components/myStatusBar";

const OpenSourceLicensesScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() == "rtl";

  const [expandedLicense, setExpandedLicense] = useState(null);

  const openSourceLibraries = [
    {
      id: 1,
      name: "React Native",
      version: "0.72.6",
      license: "MIT License",
      author: "Meta Platforms, Inc.",
      description: "A framework for building native apps using React",
      repository: "https://github.com/facebook/react-native",
      licenseText: `MIT License

Copyright (c) Meta Platforms, Inc. and affiliates.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`
    },
    {
      id: 2,
      name: "Expo SDK",
      version: "49.0.0",
      license: "MIT License",
      author: "Expo",
      description: "An open-source platform for making universal native apps",
      repository: "https://github.com/expo/expo",
      licenseText: `MIT License

Copyright (c) 2015-present 650 Industries, Inc. (aka Expo)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`
    },
    {
      id: 3,
      name: "Supabase JS",
      version: "2.38.0",
      license: "MIT License",
      author: "Supabase",
      description: "JavaScript client for Supabase",
      repository: "https://github.com/supabase/supabase-js",
      licenseText: `MIT License

Copyright (c) 2020 Supabase

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`
    },
    {
      id: 4,
      name: "React Navigation",
      version: "6.1.9",
      license: "MIT License",
      author: "React Navigation Contributors",
      description: "Routing and navigation for React Native apps",
      repository: "https://github.com/react-navigation/react-navigation",
      licenseText: `MIT License

Copyright (c) 2017 React Navigation Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`
    },
    {
      id: 5,
      name: "React Query",
      version: "4.32.6",
      license: "MIT License",
      author: "TanStack",
      description: "Powerful data synchronization for React",
      repository: "https://github.com/TanStack/query",
      licenseText: `MIT License

Copyright (c) 2021-present Tanner Linsley

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`
    },
    {
      id: 6,
      name: "React Native Vector Icons",
      version: "10.0.0",
      license: "MIT License",
      author: "Joel Arvidsson",
      description: "Customizable Icons for React Native",
      repository: "https://github.com/oblador/react-native-vector-icons",
      licenseText: `MIT License

Copyright (c) 2015 Joel Arvidsson

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`
    },
    {
      id: 7,
      name: "React i18next",
      version: "13.2.2",
      license: "MIT License",
      author: "i18next",
      description: "Internationalization framework for React/React Native",
      repository: "https://github.com/i18next/react-i18next",
      licenseText: `MIT License

Copyright (c) 2017 i18next

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`
    },
    {
      id: 8,
      name: "Stripe React Native",
      version: "0.37.2",
      license: "MIT License",
      author: "Stripe",
      description: "Stripe SDK for React Native",
      repository: "https://github.com/stripe/stripe-react-native",
      licenseText: `MIT License

Copyright (c) 2020 Stripe, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`
    },
    {
      id: 9,
      name: "React Native Size Matters",
      version: "0.4.0",
      license: "MIT License",
      author: "Niryo Haim",
      description: "A React-Native utility belt for scaling the size of your apps UI",
      repository: "https://github.com/nirsky/react-native-size-matters",
      licenseText: `MIT License

Copyright (c) 2017 Niryo Haim

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`
    },
    {
      id: 10,
      name: "Expo Linear Gradient",
      version: "12.3.0",
      license: "MIT License",
      author: "Expo",
      description: "Linear gradient library for React Native",
      repository: "https://github.com/expo/expo/tree/master/packages/expo-linear-gradient",
      licenseText: `MIT License

Copyright (c) 2015-present 650 Industries, Inc. (aka Expo)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`
    },
    {
      id: 11,
      name: "ExpressPay SDK",
      version: "3.2.1",
      license: "MIT License",
      author: "ExpressPay Technologies",
      description: "Mobile payment processing SDK for React Native applications",
      repository: "https://github.com/expresspay/react-native-sdk",
      licenseText: `MIT License

Copyright (c) 2023 ExpressPay Technologies Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Additional Terms:
- This SDK is provided for integration with ExpressPay payment services
- Users must comply with ExpressPay Terms of Service and applicable payment regulations
- PCI DSS compliance requirements apply when handling payment data
- Commercial use requires valid ExpressPay merchant account`
    }
  ];

  const toggleLicense = (id) => {
    setExpandedLicense(expandedLicense === id ? null : id);
  };

  const openRepository = (url) => {
    Alert.alert(
      "Open Repository",
      "This will open the project repository in your browser.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open", onPress: () => Linking.openURL(url) }
      ]
    );
  };

  const exportLicenses = () => {
    Alert.alert(
      "Export Licenses",
      "This will generate a complete license document with all attributions.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Export", onPress: () => console.log("Exporting licenses...") }
      ]
    );
  };

  const renderLibraryCard = (library) => (
    <View key={library.id} style={styles.libraryCard}>
      <TouchableOpacity
        style={styles.libraryHeader}
        onPress={() => toggleLicense(library.id)}
      >
        <View style={styles.libraryIcon}>
          <MaterialCommunityIcons 
            name="package-variant" 
            size={24} 
            color={Colors.primary} 
          />
        </View>
        <View style={styles.libraryInfo}>
          <Text style={styles.libraryName}>{library.name}</Text>
          <Text style={styles.libraryVersion}>v{library.version}</Text>
          <Text style={styles.libraryAuthor}>by {library.author}</Text>
          <Text style={styles.libraryDescription}>{library.description}</Text>
        </View>
        <View style={styles.libraryActions}>
          <View style={styles.licenseTag}>
            <Text style={styles.licenseTagText}>{library.license}</Text>
          </View>
          <MaterialCommunityIcons
            name={expandedLicense === library.id ? "chevron-up" : "chevron-down"}
            size={20}
            color={Colors.grey}
          />
        </View>
      </TouchableOpacity>

      {expandedLicense === library.id && (
        <View style={styles.licenseDetails}>
          <View style={styles.licenseActions}>
            <TouchableOpacity
              style={styles.repositoryButton}
              onPress={() => openRepository(library.repository)}
            >
              <MaterialCommunityIcons name="github" size={16} color={Colors.blue} />
              <Text style={styles.repositoryButtonText}>View Repository</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.licenseTextContainer}>
            <Text style={styles.licenseTitle}>License Text:</Text>
            <ScrollView style={styles.licenseTextScroll} nestedScrollEnabled>
              <Text style={styles.licenseText}>{library.licenseText}</Text>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <MyStatusBar />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons
            name={isRtl ? "arrow-forward-outline" : "arrow-back-outline"}
            size={25}
            color={Colors.black}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Open Source Licenses</Text>
        <TouchableOpacity onPress={exportLicenses} style={styles.exportButton}>
          <MaterialCommunityIcons name="download" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <View style={styles.infoHeader}>
          <MaterialCommunityIcons name="information" size={24} color={Colors.primary} />
          <Text style={styles.infoTitle}>Third-Party Libraries</Text>
        </View>
        <Text style={styles.infoDescription}>
          Casa Nirvana uses the following open source libraries and SDKs. We are grateful to the developers and contributors who make these projects possible.
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{openSourceLibraries.length}</Text>
            <Text style={styles.statLabel}>Libraries</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>MIT</Text>
            <Text style={styles.statLabel}>Primary License</Text>
          </View>
        </View>
      </View>

      {/* Libraries List */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {openSourceLibraries.map(renderLibraryCard)}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>License Compliance</Text>
          <Text style={styles.footerText}>
            All third-party libraries are used in compliance with their respective licenses. 
            For the most up-to-date license information, please visit the individual project repositories.
          </Text>
          <Text style={styles.footerSubtext}>
            Last updated: December 15, 2024
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.extraLightGrey,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 1.2,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrey,
  },
  backButton: {
    padding: Default.fixPadding * 0.5,
  },
  headerTitle: {
    ...Fonts.SemiBold18black,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: Default.fixPadding,
  },
  exportButton: {
    padding: Default.fixPadding * 0.5,
  },
  infoSection: {
    backgroundColor: Colors.white,
    margin: Default.fixPadding * 2,
    padding: Default.fixPadding * 2,
    borderRadius: 12,
    ...Default.shadow,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Default.fixPadding,
  },
  infoTitle: {
    ...Fonts.SemiBold16primary,
    marginLeft: Default.fixPadding * 0.8,
  },
  infoDescription: {
    ...Fonts.Medium14grey,
    lineHeight: 20,
    marginBottom: Default.fixPadding * 1.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...Fonts.SemiBold20primary,
    marginBottom: 2,
  },
  statLabel: {
    ...Fonts.Medium12grey,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Default.fixPadding * 2,
    paddingBottom: Default.fixPadding * 2,
  },
  libraryCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: Default.fixPadding * 1.5,
    overflow: 'hidden',
    ...Default.shadow,
  },
  libraryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Default.fixPadding * 1.5,
  },
  libraryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Default.fixPadding,
  },
  libraryInfo: {
    flex: 1,
    marginRight: Default.fixPadding,
  },
  libraryName: {
    ...Fonts.SemiBold16black,
    marginBottom: 2,
  },
  libraryVersion: {
    ...Fonts.Medium12primary,
    marginBottom: 2,
  },
  libraryAuthor: {
    ...Fonts.Medium12grey,
    marginBottom: Default.fixPadding * 0.5,
  },
  libraryDescription: {
    ...Fonts.Medium12grey,
    lineHeight: 16,
  },
  libraryActions: {
    alignItems: 'flex-end',
  },
  licenseTag: {
    backgroundColor: Colors.green + '20',
    paddingHorizontal: Default.fixPadding * 0.8,
    paddingVertical: Default.fixPadding * 0.3,
    borderRadius: 12,
    marginBottom: Default.fixPadding * 0.5,
  },
  licenseTagText: {
    ...Fonts.Medium10green,
    fontSize: 10,
  },
  licenseDetails: {
    borderTopWidth: 1,
    borderTopColor: Colors.extraLightGrey,
    padding: Default.fixPadding * 1.5,
  },
  licenseActions: {
    flexDirection: 'row',
    marginBottom: Default.fixPadding,
  },
  repositoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.blue + '10',
    paddingHorizontal: Default.fixPadding,
    paddingVertical: Default.fixPadding * 0.5,
    borderRadius: 8,
  },
  repositoryButtonText: {
    ...Fonts.Medium12blue,
    marginLeft: Default.fixPadding * 0.5,
  },
  licenseTextContainer: {
    backgroundColor: Colors.extraLightGrey,
    borderRadius: 8,
    padding: Default.fixPadding,
  },
  licenseTitle: {
    ...Fonts.Medium14black,
    marginBottom: Default.fixPadding * 0.8,
  },
  licenseTextScroll: {
    maxHeight: 200,
  },
  licenseText: {
    ...Fonts.Medium12grey,
    lineHeight: 18,
    fontFamily: 'monospace',
  },
  footer: {
    backgroundColor: Colors.white,
    padding: Default.fixPadding * 2,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: Default.fixPadding,
    ...Default.shadow,
  },
  footerTitle: {
    ...Fonts.SemiBold16black,
    marginBottom: Default.fixPadding,
    color: Colors.primary,
  },
  footerText: {
    ...Fonts.Medium14grey,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Default.fixPadding,
  },
  footerSubtext: {
    ...Fonts.Medium12grey,
    textAlign: 'center',
  },
});

export default OpenSourceLicensesScreen;
