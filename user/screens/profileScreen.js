import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
  Share,
} from "react-native";
import MyStatusBar from "../components/myStatusBar";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import { ms } from "react-native-size-matters/extend";
import AntDesign from "react-native-vector-icons/AntDesign";
import DashedLine from "react-native-dashed-line";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Octicons from "react-native-vector-icons/Octicons";
import Entypo from "react-native-vector-icons/Entypo";
import AddFamilyMemberModal from "../components/addFamilyMemberModal";
import MyVehiclesModal from "../components/myVehiclesModal";
import GatePassModal from "../components/gatePassModal";
import EntryDetailModal from "../components/entryDetailModal";
import EditFamilyMemberModal from "../components/editFamilyMemberModal";
import EditVehicleModal from "../components/editVehicleModal";
import EditFrequentEntryModal from "../components/editFrequentEntryModal";
import EditDailyHelpModal from "../components/editDailyHelpModal";
import { useListFamilyMembers } from "../hooks/useFamilyMembers";
import { useListDailyHelp } from "../hooks/useDailyHelp";
import { useListVehicles } from "../hooks/useVehicles";
import { useListFrequentEntries } from "../hooks/useFrequentEntries";
import { useUserGatePass } from "../hooks/useUserGatePass";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

const ProfileScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`profileScreen:${key}`);
  }

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);



  const shareMessage = () => {
    Share.share({
      message: "SEVENGEN",
    });
  };

  const handleEntryPress = (entry, entryType) => {
    setSelectedEntry(entry);
    setSelectedEntryType(entryType);
    setOpenEntryDetailModal(true);
  };  // Real data from Supabase - Use demo user ID for now
  const demoUserId = '8fcb1ff1-a385-4c26-8bb4-80c5f23477de';
  const { data: familyMembers, isLoading: familyLoading, error: familyError } = useListFamilyMembers(demoUserId);
  const { data: dailyHelp, isLoading: dailyHelpLoading, error: dailyHelpError } = useListDailyHelp(demoUserId);
  const { data: vehicles, isLoading: vehiclesLoading, error: vehiclesError } = useListVehicles(demoUserId);
  const { data: frequentEntries, isLoading: frequentEntriesLoading, error: frequentEntriesError } = useListFrequentEntries(demoUserId);
  
  // Get user's gate pass data - use hardcoded demo user ID for consistency
  const { data: userGatePass, isLoading: userGatePassLoading } = useQuery({
    queryKey: ['user-gate-pass'],
    queryFn: async () => {
      console.log('🎫 ProfileScreen - Fetching user gate pass for demo user ID:', demoUserId);
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, 
          user_id, 
          full_name, 
          email, 
          qr_code_data, 
          entry_code, 
          society_id, 
          unit_id,
          units(block, number),
          societies!profiles_society_id_fkey(name)
        `)
        .eq('user_id', demoUserId)
        .single();

      if (error) {
        console.error('🎫 ProfileScreen - Error fetching user gate pass:', error);
        throw error;
      }

      console.log('🎫 ProfileScreen - Retrieved user gate pass data:', data);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });



  // Transform data for UI
  const myFamilyList = familyMembers?.map((member, index) => ({
    key: member.id,
    image: member.avatar_url || require("../assets/images/pic1.png"),
    name: member.name,
    phone: member.phone,
    society_name: "Casa Nirvana",
    unit_number: "A-203",
    block_number: "A",
    other: member.relation,
    qrCode: member.qr_code,
    entryCode: member.entry_code,
  })) || [];
  
  const dailyHelpList = dailyHelp?.map((help, index) => ({
    key: help.id,
    image: help.avatar_url || require("../assets/images/pic1.png"),
    name: help.name,
    phone: help.phone,
    society_name: "Casa Nirvana",
    unit_number: "A-203",
    block_number: "A",
    other: help.type,
    qrCode: help.qr_code,
    entryCode: help.entry_code,
  })) || [];
  const myVehiclesList = vehicles?.map((vehicle, index) => ({
    key: vehicle.id,
    image: vehicle.avatar_url || require("../assets/images/pic1.png"),
    name: vehicle.vehicle_number,
    phone: vehicle.phone,
    model: vehicle.model,
    color: vehicle.color,
    plate_number: vehicle.plate_number,
    society_name: "Casa Nirvana",
    unit_number: "A-203",
    block_number: "A",
    other: `${vehicle.model} (${vehicle.color})`,
    qrCode: vehicle.qr_code,
    entryCode: vehicle.entry_code,
  })) || [];
  
  const frequentEntriesList = frequentEntries?.map((entry, index) => ({
    key: entry.id,
    image: entry.avatar_url || require("../assets/images/pic1.png"),
    name: entry.name,
    phone: entry.phone,
    society_name: "Casa Nirvana",
    unit_number: "A-203",
    block_number: "A",
    other: entry.relation,
    qrCode: entry.qr_code,
    entryCode: entry.entry_code,
  })) || [];

  const [selectedName, setSelectedName] = useState();
  const [selectedQRCode, setSelectedQRCode] = useState();
  const [selectedEntryCode, setSelectedEntryCode] = useState();

  const renderFamilyItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => handleEntryPress(item, 'family_member')}
        style={{
          flex: 1,
          padding: Default.fixPadding,
          marginHorizontal: Default.fixPadding * 0.75,
          marginTop: Default.fixPadding * 1.5,
          marginBottom: Default.fixPadding * 2.5,
          maxWidth: ms(130),
          borderRadius: 10,
          backgroundColor: Colors.white,
          ...Default.shadow,
        }}
      >
        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            justifyContent: "flex-start",
          }}
        >
          <Image
            source={
              typeof item.image === 'number' 
                ? item.image 
                : typeof item.image === 'string' && item.image.startsWith('http')
                  ? { uri: item.image }
                  : require("../assets/images/pic1.png")
            }
            style={{
              resizeMode: "cover",
              width: 48,
              height: 48,
              borderRadius: 24,
            }}
          />
          <TouchableOpacity
            onPress={() => {
              setSelectedName(item.name);
              setSelectedQRCode(item.qrCode);
              setSelectedEntryCode(item.entryCode);
              setOpenGatePassModal(true);
            }}
          >
            <Image
              source={require("../assets/images/qrCode.png")}
              style={{
                resizeMode: "cover",
                width: 25,
                height: 25,
                marginLeft: isRtl ? 0 : Default.fixPadding * 3.8,
                marginRight: isRtl ? Default.fixPadding * 3.8 : 0,
              }}
            />
          </TouchableOpacity>
        </View>

        <View style={{ alignItems: isRtl ? "flex-end" : "flex-start" }}>
          <Text
            numberOfLines={1}
            style={{
              ...Fonts.SemiBold15black,
              overflow: "hidden",
              marginTop: Default.fixPadding * 0.8,
              marginBottom: Default.fixPadding * 0.2,
            }}
          >
            {item.name}
          </Text>
          <Text
            numberOfLines={1}
            style={{ ...Fonts.Medium15grey, overflow: "hidden" }}
          >
            {item.other}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDailyHelpItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => handleEntryPress(item, 'daily_help')}
        style={{
          flex: 1,
          padding: Default.fixPadding,
          marginHorizontal: Default.fixPadding * 0.75,
          marginTop: Default.fixPadding * 1.5,
          marginBottom: Default.fixPadding * 2.5,
          maxWidth: ms(130),
          borderRadius: 10,
          backgroundColor: Colors.white,
          ...Default.shadow,
        }}
      >
        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            justifyContent: "flex-start",
          }}
        >
          <Image
            source={
              typeof item.image === 'number' 
                ? item.image 
                : typeof item.image === 'string' && item.image.startsWith('http')
                  ? { uri: item.image }
                  : require("../assets/images/pic1.png")
            }
            style={{
              resizeMode: "cover",
              width: 48,
              height: 48,
              borderRadius: 24,
            }}
          />
          <TouchableOpacity
            onPress={() => {
              setSelectedName(item.name);
              setSelectedQRCode(item.qrCode);
              setSelectedEntryCode(item.entryCode);
              setOpenGatePassModal(true);
            }}
          >
            <Image
              source={require("../assets/images/qrCode.png")}
              style={{
                resizeMode: "cover",
                width: 25,
                height: 25,
                marginLeft: isRtl ? 0 : Default.fixPadding * 3.8,
                marginRight: isRtl ? Default.fixPadding * 3.8 : 0,
              }}
            />
          </TouchableOpacity>
        </View>

        <View style={{ alignItems: isRtl ? "flex-end" : "flex-start" }}>
          <Text
            numberOfLines={1}
            style={{
              ...Fonts.SemiBold15black,
              overflow: "hidden",
              marginTop: Default.fixPadding * 0.8,
              marginBottom: Default.fixPadding * 0.2,
            }}
          >
            {item.name}
          </Text>
          <Text
            numberOfLines={1}
            style={{ ...Fonts.Medium15grey, overflow: "hidden" }}
          >
            {item.other}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderVehicleItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => handleEntryPress(item, 'vehicle')}
        style={{
          flex: 1,
          padding: Default.fixPadding,
          marginHorizontal: Default.fixPadding * 0.75,
          marginTop: Default.fixPadding * 1.5,
          marginBottom: Default.fixPadding * 2.5,
          maxWidth: ms(130),
          borderRadius: 10,
          backgroundColor: Colors.white,
          ...Default.shadow,
        }}
      >
        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            justifyContent: "flex-start",
          }}
        >
          <Image
            source={
              typeof item.image === 'number' 
                ? item.image 
                : typeof item.image === 'string' && item.image.startsWith('http')
                  ? { uri: item.image }
                  : require("../assets/images/pic1.png")
            }
            style={{
              resizeMode: "cover",
              width: 48,
              height: 48,
              borderRadius: 24,
            }}
          />
          <TouchableOpacity
            onPress={() => {
              setSelectedName(item.name);
              setSelectedQRCode(item.qrCode);
              setSelectedEntryCode(item.entryCode);
              setOpenGatePassModal(true);
            }}
          >
            <Image
              source={require("../assets/images/qrCode.png")}
              style={{
                resizeMode: "cover",
                width: 25,
                height: 25,
                marginLeft: isRtl ? 0 : Default.fixPadding * 3.8,
                marginRight: isRtl ? Default.fixPadding * 3.8 : 0,
              }}
            />
          </TouchableOpacity>
        </View>

        <View style={{ alignItems: isRtl ? "flex-end" : "flex-start" }}>
          <Text
            numberOfLines={1}
            style={{
              ...Fonts.SemiBold15black,
              overflow: "hidden",
              marginTop: Default.fixPadding * 0.8,
              marginBottom: Default.fixPadding * 0.2,
            }}
          >
            {item.name}
          </Text>
          <Text
            numberOfLines={1}
            style={{ ...Fonts.Medium15grey, overflow: "hidden" }}
          >
            {item.other}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFrequentEntryItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => handleEntryPress(item, 'frequent_entry')}
        style={{
          flex: 1,
          padding: Default.fixPadding,
          marginHorizontal: Default.fixPadding * 0.75,
          marginTop: Default.fixPadding * 1.5,
          marginBottom: Default.fixPadding * 2.5,
          maxWidth: ms(130),
          borderRadius: 10,
          backgroundColor: Colors.white,
          ...Default.shadow,
        }}
      >
        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            justifyContent: "flex-start",
          }}
        >
          <Image
            source={
              typeof item.image === 'number' 
                ? item.image 
                : typeof item.image === 'string' && item.image.startsWith('http')
                  ? { uri: item.image }
                  : require("../assets/images/pic1.png")
            }
            style={{
              resizeMode: "cover",
              width: 48,
              height: 48,
              borderRadius: 24,
            }}
          />
          <TouchableOpacity
            onPress={() => {
              setSelectedName(item.name);
              setSelectedQRCode(item.qrCode);
              setSelectedEntryCode(item.entryCode);
              setOpenGatePassModal(true);
            }}
          >
            <Image
              source={require("../assets/images/qrCode.png")}
              style={{
                resizeMode: "cover",
                width: 25,
                height: 25,
                marginLeft: isRtl ? 0 : Default.fixPadding * 3.8,
                marginRight: isRtl ? Default.fixPadding * 3.8 : 0,
              }}
            />
          </TouchableOpacity>
        </View>

        <View style={{ alignItems: isRtl ? "flex-end" : "flex-start" }}>
          <Text
            numberOfLines={1}
            style={{
              ...Fonts.SemiBold15black,
              overflow: "hidden",
              marginTop: Default.fixPadding * 0.8,
              marginBottom: Default.fixPadding * 0.2,
            }}
          >
            {item.name}
          </Text>
          <Text
            numberOfLines={1}
            style={{ ...Fonts.Medium15grey, overflow: "hidden" }}
          >
            {item.other}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const [openAddFamilyMemberModal, setOpenAddFamilyMemberModal] =
    useState(false);

  const [id, setId] = useState();

  const [openAddVehicleModal, setOpenAddVehicleModal] = useState(false);

  const [openGatePassModal, setOpenGatePassModal] = useState(false);
  
  // Entry detail modal state
  const [openEntryDetailModal, setOpenEntryDetailModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedEntryType, setSelectedEntryType] = useState("");
  
  // Edit modal states
  const [openEditFamilyModal, setOpenEditFamilyModal] = useState(false);
  const [openEditVehicleModal, setOpenEditVehicleModal] = useState(false);
  const [openEditFrequentEntryModal, setOpenEditFrequentEntryModal] = useState(false);
  const [openEditDailyHelpModal, setOpenEditDailyHelpModal] = useState(false);
  const [editEntryData, setEditEntryData] = useState(null);
  const [editEntryType, setEditEntryType] = useState(null);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <MyStatusBar />
      <View
        style={{
          flexDirection: isRtl ? "row-reverse" : "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: Default.fixPadding * 1.2,
          marginBottom: Default.fixPadding * 0.8,
          marginHorizontal: Default.fixPadding * 2,
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            ...Fonts.SemiBold22black,
            overflow: "hidden",
            textAlign: isRtl ? "right" : "left",
          }}
        >
          {tr("profile")}
        </Text>
        <TouchableOpacity onPress={() => navigation.push("settingScreen")}>
          <AntDesign name={"setting"} size={24} color={Colors.black} />
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{
            marginTop: Default.fixPadding * 0.8,
            marginBottom: Default.fixPadding * 2,
            marginHorizontal: Default.fixPadding * 2,
            borderWidth: 1,
            borderColor: Colors.lightLinkWater,
            borderRadius: 5,
            backgroundColor: Colors.regularLightSky,
          }}
        >
          <View
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              alignItems: "center",
              padding: Default.fixPadding,
            }}
          >
            <View style={{ flex: 1.7 }}>
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  width: 55,
                  height: 55,
                  borderRadius: 28,
                  backgroundColor: Colors.white,
                  ...Default.shadow,
                }}
              >
                <Image
                  source={require("../assets/images/pic1.png")}
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                  }}
                />
              </View>
            </View>
            <View
              style={{
                flex: 6.3,
                alignItems: isRtl ? "flex-end" : "flex-start",
                marginHorizontal: Default.fixPadding,
              }}
            >
              <Text
                numberOfLines={1}
                style={{ ...Fonts.SemiBold18primary, overflow: "hidden" }}
              >
                Demo User
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  ...Fonts.Medium14grey,
                  overflow: "hidden",
                  marginTop: Default.fixPadding * 0.5,
                }}
              >
                {tr("viewProfile")}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                console.log('🎫 ProfileScreen - userGatePass data:', userGatePass);
                console.log('🎫 ProfileScreen - QR code data:', userGatePass?.qr_code_data);
                
                if (!userGatePass?.qr_code_data) {
                  console.log('🎫 ProfileScreen - No QR code data available');
                  return;
                }
                
                // Update QR code data with unit and society information
                let updatedQRCodeData = userGatePass.qr_code_data;
                try {
                  const qrData = JSON.parse(userGatePass.qr_code_data);
                  const unitBlock = userGatePass.units?.[0]?.block;
                  const unitNumber = userGatePass.units?.[0]?.number;
                  const societyName = userGatePass.societies?.[0]?.name;
                  
                  // Use database values if available, otherwise keep existing QR data
                  if (unitBlock && unitNumber) {
                    qrData.unit_block = unitBlock;
                    qrData.unit_number = unitNumber;
                  }
                  
                  if (societyName) {
                    qrData.society_name = societyName;
                  }
                  
                  updatedQRCodeData = JSON.stringify(qrData);
                } catch (error) {
                  console.error('🎫 ProfileScreen - Error updating QR data:', error);
                }
                
                setSelectedName(userGatePass?.full_name || "Demo User");
                setSelectedQRCode(updatedQRCodeData);
                setSelectedEntryCode(userGatePass?.entry_code);
                setOpenGatePassModal(true);
              }}
              style={{
                flex: 1.5,
                alignItems: isRtl ? "flex-start" : "flex-end",
              }}
            >
              <Image
                source={require("../assets/images/qrCode.png")}
                style={{ width: 40, height: 40, resizeMode: "contain" }}
              />
            </TouchableOpacity>
          </View>

          <DashedLine
            dashGap={2.5}
            dashLength={2.5}
            dashThickness={1.5}
            dashColor={Colors.grey}
          />

          <View
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              alignItems: "center",
              padding: Default.fixPadding,
            }}
          >
            <View
              style={{
                flex: 9,
                marginRight: isRtl ? 0 : Default.fixPadding * 2,
                marginLeft: isRtl ? Default.fixPadding * 2 : 0,
              }}
            >
              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    flex: 3,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingRight: isRtl ? 0 : Default.fixPadding * 0.5,
                    paddingLeft: isRtl ? Default.fixPadding * 0.5 : 0,
                  }}
                >
                  <View style={styles.circle}>
                    <Image
                      source={require("../assets/images/building.png")}
                      style={{ width: 20, height: 20, resizeMode: "contain" }}
                    />
                  </View>

                  <Text
                    style={{
                      ...Fonts.Medium14black,
                      textAlign: "center",
                      marginTop: Default.fixPadding * 0.5,
                    }}
                  >
                    Casa Nirvana
                  </Text>
                </View>

                <View
                  style={{
                    flex: 3,
                    justifyContent: "center",
                    alignItems: "center",
                    borderLeftWidth: 1,
                    borderLeftColor: Colors.nobel,
                    borderRightWidth: 1,
                    borderRightColor: Colors.nobel,
                  }}
                >
                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      paddingHorizontal: Default.fixPadding * 0.5,
                    }}
                  >
                    <View style={styles.circle}>
                      <Octicons name="home" size={20} color={Colors.primary} />
                    </View>

                    <Text
                      numberOfLines={1}
                      style={{
                        ...Fonts.Medium14black,
                        overflow: "hidden",
                        marginTop: Default.fixPadding * 0.5,
                      }}
                    >
                      {`${tr("flatNo")} : `}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={{
                        ...Fonts.Medium14black,
                      }}
                    >
                      203
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    flex: 3,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingHorizontal: Default.fixPadding * 0.5,
                  }}
                >
                  <View style={styles.circle}>
                    <MaterialCommunityIcons
                      name="home-city-outline"
                      size={20}
                      color={Colors.primary}
                    />
                  </View>

                  <Text
                    numberOfLines={1}
                    style={{
                      ...Fonts.Medium14black,
                      overflow: "hidden",
                      marginTop: Default.fixPadding * 0.5,
                    }}
                  >
                    {`${tr("blockNo")} : `}
                  </Text>
                  <Text
                    style={{
                      ...Fonts.Medium14black,
                    }}
                  >
                    A
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={shareMessage}
              style={{
                flex: 1,
                alignItems: isRtl ? "flex-start" : "flex-end",
              }}
            >
              <MaterialCommunityIcons
                name="share-variant-outline"
                size={24}
                color={Colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: Default.fixPadding * 1.2,
            marginBottom: Default.fixPadding * 2,
            backgroundColor: Colors.regularGrey,
          }}
        >
          <Text style={{ ...Fonts.SemiBold16primary }}>{tr("household")}</Text>
        </View>

        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
            marginHorizontal: Default.fixPadding * 2,
          }}
        >
          <View
            style={{
              flex: 8.3,
              alignItems: isRtl ? "flex-end" : "flex-start",
              marginRight: isRtl ? 0 : Default.fixPadding,
              marginLeft: isRtl ? Default.fixPadding : 0,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.SemiBold16black,
                overflow: "hidden",
                marginBottom: Default.fixPadding * 0.5,
              }}
            >
              {tr("myFamily")}
            </Text>
            <Text
              numberOfLines={1}
              style={{ ...Fonts.Medium14grey, overflow: "hidden" }}
            >
              {tr("addFamilyMember")}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              setId("1");
              setOpenAddFamilyMemberModal(true);
            }}
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              ...styles.addBtn,
            }}
          >
            <Entypo name="plus" size={18} color={Colors.white} />
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.SemiBold15white,
                flex: 1,
                overflow: "hidden",
                textAlign: isRtl ? "right" : "left",
                marginLeft: isRtl ? 0 : Default.fixPadding * 0.5,
                marginRight: isRtl ? Default.fixPadding * 0.5 : 0,
              }}
            >
              {tr("add")}
            </Text>
          </TouchableOpacity>
        </View>

                  {familyLoading ? (
            <View style={{ padding: Default.fixPadding * 2, alignItems: isRtl ? 'flex-end' : 'flex-start' }}>
              <Text style={{ ...Fonts.Medium14grey }}>Loading family members...</Text>
            </View>
        ) : (
          <FlatList
            horizontal
            data={myFamilyList}
                            renderItem={renderFamilyItem}
            keyExtractor={(item) => item.key}
            showsHorizontalScrollIndicator={false}
            inverted={isRtl}
            contentContainerStyle={{
              paddingHorizontal: Default.fixPadding * 1.25,
            }}
          />
        )}

        <DashedLine
          dashGap={2.5}
          dashLength={2.5}
          dashThickness={1.5}
          dashColor={Colors.grey}
        />

        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
            marginTop: Default.fixPadding * 2.5,
            marginHorizontal: Default.fixPadding * 2,
          }}
        >
          <View
            style={{
              flex: 8.3,
              alignItems: isRtl ? "flex-end" : "flex-start",
              marginRight: isRtl ? 0 : Default.fixPadding,
              marginLeft: isRtl ? Default.fixPadding : 0,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.SemiBold16black,
                overflow: "hidden",
                marginBottom: Default.fixPadding * 0.5,
              }}
            >
              {tr("dailyHelp")}
            </Text>
            <Text
              numberOfLines={1}
              style={{ ...Fonts.Medium14grey, overflow: "hidden" }}
            >
              {tr("addMaidLaundry")}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              setId("3");
              setOpenAddFamilyMemberModal(true);
            }}
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              ...styles.addBtn,
            }}
          >
            <Entypo name="plus" size={18} color={Colors.white} />
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.SemiBold15white,
                flex: 1,
                overflow: "hidden",
                textAlign: isRtl ? "right" : "left",
                marginLeft: isRtl ? 0 : Default.fixPadding * 0.5,
                marginRight: isRtl ? Default.fixPadding * 0.5 : 0,
              }}
            >
              {tr("add")}
            </Text>
          </TouchableOpacity>
        </View>

                  {dailyHelpLoading ? (
            <View style={{ padding: Default.fixPadding * 2, alignItems: isRtl ? 'flex-end' : 'flex-start' }}>
              <Text style={{ ...Fonts.Medium14grey }}>Loading daily help...</Text>
            </View>
        ) : (
                      <FlatList
              horizontal
              data={dailyHelpList}
              renderItem={renderDailyHelpItem}
              keyExtractor={(item) => item.key}
            showsHorizontalScrollIndicator={false}
            inverted={isRtl}
            contentContainerStyle={{
              paddingHorizontal: Default.fixPadding * 1.25,
            }}
          />
        )}

        <DashedLine
          dashGap={2.5}
          dashLength={2.5}
          dashThickness={1.5}
          dashColor={Colors.grey}
        />

        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
            marginTop: Default.fixPadding * 2.5,
            marginHorizontal: Default.fixPadding * 2,
          }}
        >
          <View
            style={{
              flex: 8.3,
              alignItems: isRtl ? "flex-end" : "flex-start",
              marginRight: isRtl ? 0 : Default.fixPadding,
              marginLeft: isRtl ? Default.fixPadding : 0,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.SemiBold16black,
                overflow: "hidden",
                marginBottom: Default.fixPadding * 0.5,
              }}
            >
              {tr("myVehicles")}
            </Text>
            <Text
              numberOfLines={1}
              style={{ ...Fonts.Medium14grey, overflow: "hidden" }}
            >
              {tr("addVehiclesQuick")}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setOpenAddVehicleModal(true)}
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              ...styles.addBtn,
            }}
          >
            <Entypo name="plus" size={18} color={Colors.white} />
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.SemiBold15white,
                flex: 1,
                overflow: "hidden",
                textAlign: isRtl ? "right" : "left",
                marginLeft: isRtl ? 0 : Default.fixPadding * 0.5,
                marginRight: isRtl ? Default.fixPadding * 0.5 : 0,
              }}
            >
              {tr("add")}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ alignItems: isRtl ? "flex-end" : "flex-start" }}>
          {vehiclesLoading ? (
            <View style={{ padding: Default.fixPadding * 2, alignItems: isRtl ? 'flex-end' : 'flex-start' }}>
              <Text style={{ ...Fonts.Medium14grey }}>Loading vehicles...</Text>
            </View>
          ) : (
            <FlatList
              horizontal
              data={myVehiclesList}
              renderItem={renderVehicleItem}
              keyExtractor={(item) => item.key}
              showsHorizontalScrollIndicator={false}
              inverted={isRtl}
              contentContainerStyle={{
                paddingHorizontal: Default.fixPadding * 1.25,
              }}
            />
          )}
        </View>
        <DashedLine
          dashGap={2.5}
          dashLength={2.5}
          dashThickness={1.5}
          dashColor={Colors.grey}
        />

        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
            marginTop: Default.fixPadding * 2.5,
            marginHorizontal: Default.fixPadding * 2,
          }}
        >
          <View
            style={{
              flex: 8.3,
              alignItems: isRtl ? "flex-end" : "flex-start",
              marginRight: isRtl ? 0 : Default.fixPadding,
              marginLeft: isRtl ? Default.fixPadding : 0,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.SemiBold16black,
                overflow: "hidden",
                marginBottom: Default.fixPadding * 0.5,
              }}
            >
              {tr("frequentEntries")}
            </Text>
            <Text
              numberOfLines={1}
              style={{ ...Fonts.Medium14grey, overflow: "hidden" }}
            >
              {tr("addFrequentPerson")}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              setId("2");
              setOpenAddFamilyMemberModal(true);
            }}
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              ...styles.addBtn,
            }}
          >
            <Entypo name="plus" size={18} color={Colors.white} />
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.SemiBold15white,
                flex: 1,
                overflow: "hidden",
                marginLeft: isRtl ? 0 : Default.fixPadding * 0.5,
                marginRight: isRtl ? Default.fixPadding * 0.5 : 0,
                textAlign: isRtl ? "right" : "left",
              }}
            >
              {tr("add")}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: isRtl ? "flex-end" : "flex-start" }}>
          {frequentEntriesLoading ? (
            <View style={{ padding: Default.fixPadding * 2, alignItems: isRtl ? 'flex-end' : 'flex-start' }}>
              <Text style={{ ...Fonts.Medium14grey }}>Loading frequent entries...</Text>
            </View>
          ) : (
            <FlatList
              horizontal
              data={frequentEntriesList}
              renderItem={renderFrequentEntryItem}
              keyExtractor={(item) => item.key}
              showsHorizontalScrollIndicator={false}
              inverted={isRtl}
              contentContainerStyle={{
                paddingHorizontal: Default.fixPadding * 1.25,
                paddingBottom: Default.fixPadding,
              }}
            />
          )}
        </View>
      </ScrollView>

      <AddFamilyMemberModal
        visible={openAddFamilyMemberModal}
        modalClose={() => setOpenAddFamilyMemberModal(false)}
        id={id}
      />

      <MyVehiclesModal
        visible={openAddVehicleModal}
        modalClose={() => setOpenAddVehicleModal(false)}
      />

              <GatePassModal
          visible={openGatePassModal}
          modalClose={() => setOpenGatePassModal(false)}
          visitorData={{
            visitor_name: selectedName,
            qr_code_data: selectedQRCode,
            entry_code: selectedEntryCode
          }}
          onDownloadHandle={() => setOpenGatePassModal(false)}
          onShareClose={() => setOpenGatePassModal(false)}
        />

                    <EntryDetailModal
              visible={openEntryDetailModal}
              onClose={() => setOpenEntryDetailModal(false)}
              entry={selectedEntry}
              entryType={selectedEntryType}
              onEditFamilyMember={(entry) => {
                console.log('Opening edit family modal with data:', entry);
                setOpenEntryDetailModal(false);
                setEditEntryData(entry);
                setEditEntryType('family_member');
                setOpenEditFamilyModal(true);
                console.log('Edit modal state set to true');
              }}
              onEditDailyHelp={(entry) => {
                setOpenEntryDetailModal(false);
                setEditEntryData(entry);
                setEditEntryType('daily_help');
                setOpenEditDailyHelpModal(true);
              }}
              onEditVehicle={(entry) => {
                setOpenEntryDetailModal(false);
                setEditEntryData(entry);
                setEditEntryType('vehicle');
                setOpenEditVehicleModal(true);
              }}
              onEditFrequentEntry={(entry) => {
                setOpenEntryDetailModal(false);
                setEditEntryData(entry);
                setEditEntryType('frequent_entry');
                setOpenEditFrequentEntryModal(true);
              }}
            />

      {/* Edit Modals */}
      <EditFamilyMemberModal
        visible={openEditFamilyModal}
        onClose={() => setOpenEditFamilyModal(false)}
        entryData={editEntryData}
        entryType={editEntryType}
      />

      <EditVehicleModal
        visible={openEditVehicleModal}
        onClose={() => setOpenEditVehicleModal(false)}
        entryData={editEntryData}
        entryType={editEntryType}
      />

      <EditFrequentEntryModal
        visible={openEditFrequentEntryModal}
        onClose={() => setOpenEditFrequentEntryModal(false)}
        entryData={editEntryData}
        entryType={editEntryType}
      />

      <EditDailyHelpModal
        visible={openEditDailyHelpModal}
        onClose={() => setOpenEditDailyHelpModal(false)}
        entryData={editEntryData}
        entryType={editEntryType}
      />
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  circle: {
    justifyContent: "center",
    alignItems: "center",
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.nobelOpacity50,
    backgroundColor: Colors.regularGrey,
  },
  addBtn: {
    flex: 1.7,
    justifyContent: "center",
    alignItems: "center",
    padding: Default.fixPadding * 0.6,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    ...Default.shadow,
  },
});
