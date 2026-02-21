import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  TouchableWithoutFeedback,
  Alert,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';
import { useTranslation } from 'react-i18next';
import { Default, Fonts, Colors } from '../constants/styles';
import { ms } from 'react-native-size-matters/extend';
import { useDeleteFamilyMember } from '../hooks/useFamilyMembers';
import { useDeleteDailyHelp } from '../hooks/useDailyHelp';
import { useDeleteVehicle } from '../hooks/useVehicles';
import { useDeleteFrequentEntry } from '../hooks/useFrequentEntries';
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  circle: {
    justifyContent: "center",
    alignItems: "center",
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: Colors.regularSky,
  },
  button: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Default.fixPadding * 1.4,
    marginHorizontal: Default.fixPadding * 1.1,
    borderRadius: 10,
  },
});

const EntryDetailModal = ({ visible, onClose, entry, entryType, onEditFamilyMember, onEditDailyHelp, onEditVehicle, onEditFrequentEntry }) => {
  const { t, i18n } = useTranslation();
  const { user, profile } = useAuth();
  const isRtl = i18n.dir() === 'rtl';
  const activeUserId = user?.id || profile?.user_id || null;
  const hasContent = (value) => value !== null && value !== undefined && value !== "";

  // Delete hooks
  const deleteFamilyMember = useDeleteFamilyMember();
  const deleteDailyHelp = useDeleteDailyHelp();
  const deleteVehicle = useDeleteVehicle();
  const deleteFrequentEntry = useDeleteFrequentEntry();

  const getEntryTypeTitle = () => {
    switch (entryType) {
      case 'family_member':
        return 'My Family Member';
      case 'daily_help':
        return 'My Daily Help';
      case 'vehicle':
        return 'My Vehicle';
      case 'frequent_entry':
        return 'My Frequent Entry';
      default:
        return 'Entry Details';
    }
  };

  const tr = (key) => {
    return t(key);
  };

  const getEntryIcon = () => {
    switch (entryType) {
      case 'family_member':
        return 'account-group';
      case 'daily_help':
        return 'account-cog';
      case 'vehicle':
        return 'car';
      case 'frequent_entry':
        return 'account-clock';
      default:
        return 'account';
    }
  };

  const getEntryColor = () => {
    switch (entryType) {
      case 'family_member':
        return Colors.green;
      case 'daily_help':
        return Colors.orange;
      case 'vehicle':
        return Colors.blue;
      case 'frequent_entry':
        return Colors.primary;
      default:
        return Colors.primary;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              if (!activeUserId) {
                Alert.alert('Auth Error', 'Unable to resolve your account. Please sign in again.');
                return;
              }

              // Call the appropriate delete function based on entry type
              switch (entryType) {
                case 'family_member':
                  await deleteFamilyMember.mutateAsync({ id: entry.key, userId: activeUserId });
                  break;
                case 'daily_help':
                  await deleteDailyHelp.mutateAsync({ id: entry.key, userId: activeUserId });
                  break;
                case 'vehicle':
                  await deleteVehicle.mutateAsync({ id: entry.key, userId: activeUserId });
                  break;
                case 'frequent_entry':
                  await deleteFrequentEntry.mutateAsync({ id: entry.key, userId: activeUserId });
                  break;
                default:
                  console.error('Unknown entry type:', entryType);
                  return;
              }
              
              // Close the modal after successful deletion
              onClose();
            } catch (error) {
              console.error('Error deleting entry:', error);
              Alert.alert('Error', 'Failed to delete entry. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleEdit = () => {
    // Open the appropriate edit modal based on entry type
    switch (entryType) {
      case 'family_member':
        // Open family member edit modal
        if (onEditFamilyMember) {
          onEditFamilyMember(entry);
        }
        break;
      case 'daily_help':
        // Open daily help edit modal
        if (onEditDailyHelp) {
          onEditDailyHelp(entry);
        }
        break;
      case 'vehicle':
        // Open vehicle edit modal
        if (onEditVehicle) {
          onEditVehicle(entry);
        }
        break;
      case 'frequent_entry':
        // Open frequent entry edit modal
        if (onEditFrequentEntry) {
          onEditFrequentEntry(entry);
        }
        break;
      default:
        console.error('Unknown entry type:', entryType);
    }
  };

  if (!entry) return null;

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.transparentBlack,
        }}
      >
        <TouchableWithoutFeedback onPress={() => {}}>
          <View
            style={{
              maxHeight: height / 1.8,
              width: width * 0.9,
              borderRadius: 20,
              backgroundColor: Colors.white,
              ...Default.shadow,
            }}
          >
              <TouchableOpacity
                onPress={onClose}
                style={{
                  alignSelf: isRtl ? "flex-start" : "flex-end",
                  paddingTop: Default.fixPadding,
                  paddingHorizontal: Default.fixPadding * 1.3,
                }}
              >
                <Ionicons name="close" size={18} color={Colors.grey} />
              </TouchableOpacity>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View>
                  <View
                    style={{ justifyContent: "center", alignItems: "center" }}
                  >
                    <Image
                      source={
                        typeof entry.image === 'number' 
                          ? entry.image 
                          : typeof entry.image === 'string' && entry.image.startsWith('http')
                            ? { uri: entry.image }
                            : entry.avatar_url 
                              ? { uri: entry.avatar_url }
                              : require("../assets/images/pic1.png")
                      }
                      style={{
                        width: ms(79),
                        height: ms(79),
                        borderRadius: 5,
                      }}
                    />

                    <Text
                      style={{
                        ...Fonts.SemiBold16black,
                        marginTop: Default.fixPadding,
                      }}
                    >
                      {entry.name || entry.full_name}
                    </Text>
                    {/* Phone Number */}
                    {hasContent(entry.phone) && (
                      <Text
                        style={{
                          ...Fonts.Medium14grey,
                          marginTop: Default.fixPadding * 0.5,
                        }}
                      >
                        {entry.phone}
                      </Text>
                    )}
                    {/* Vehicle Number */}
                    {entryType === 'vehicle' && hasContent(entry.plate_number) && (
                      <Text
                        style={{
                          ...Fonts.Medium14grey,
                          marginTop: Default.fixPadding * 0.5,
                        }}
                      >
                        {entry.plate_number}
                      </Text>
                    )}
                    {/* Vehicle Model and Color */}
                    {entryType === 'vehicle' && (hasContent(entry.model) || hasContent(entry.color)) && (
                      <Text
                        style={{
                          ...Fonts.Medium14grey,
                          marginTop: Default.fixPadding * 0.5,
                        }}
                      >
                        {entry.model && entry.color ? `${entry.model} (${entry.color})` : entry.model || entry.color}
                      </Text>
                    )}
                    <Text
                      style={{
                        ...Fonts.Medium14grey,
                        marginTop: Default.fixPadding * 0.5,
                      }}
                    >
                      {entry.relation || entry.type || getEntryTypeTitle()}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: isRtl ? "row-reverse" : "row",
                      alignItems: "center",
                      marginVertical: Default.fixPadding * 3,
                      marginHorizontal: Default.fixPadding * 1.5,
                    }}
                  >
                    {/* Community Name Card */}
                    <View
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        paddingHorizontal: Default.fixPadding * 0.5,
                      }}
                    >
                      <View style={styles.circle}>
                        <Image
                          source={require("../assets/images/building.png")}
                          style={{
                            resizeMode: "contain",
                            width: 20,
                            height: 20,
                          }}
                        />
                      </View>

                      <Text
                        numberOfLines={2}
                        style={{
                          ...Fonts.Medium14black,
                          overflow: "hidden",
                          textAlign: "center",
                          marginTop: Default.fixPadding,
                        }}
                      >
                        {entry.community_name || "Casa Nirvana"}
                      </Text>
                    </View>

                    <View
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <View
                        style={{
                          height: 60,
                          borderLeftWidth: 1,
                          borderLeftColor: Colors.grey,
                        }}
                      />
                      <View
                        style={{
                          justifyContent: "center",
                          alignItems: "center",
                          width: width / 3.8,
                          paddingHorizontal: Default.fixPadding * 0.5,
                        }}
                      >
                        <View style={styles.circle}>
                          <Octicons
                            name="home"
                            size={20}
                            color={Colors.primary}
                          />
                        </View>

                        <Text
                          numberOfLines={1}
                          style={{
                            ...Fonts.Medium14black,
                            overflow: "hidden",
                            marginTop: Default.fixPadding,
                          }}
                        >
                          {`Flat No. : `}
                        </Text>
                        <Text
                          numberOfLines={1}
                          style={{
                            ...Fonts.Medium14black,
                          }}
                        >
                          {entry.unit_number || "A-203"}
                        </Text>
                      </View>

                      <View
                        style={{
                          height: 60,
                          borderRightWidth: 1,
                          borderRightColor: Colors.grey,
                        }}
                      />
                    </View>

                    <View
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        paddingHorizontal: Default.fixPadding * 0.5,
                      }}
                    >
                      <View style={styles.circle}>
                        <MaterialCommunityIcons
                          name="home-city-outline"
                          size={22}
                          color={Colors.primary}
                        />
                      </View>

                      <Text
                        numberOfLines={1}
                        style={{
                          ...Fonts.Medium14black,
                          overflow: "hidden",
                          marginTop: Default.fixPadding,
                        }}
                                              >
                          {`Block No. : `}
                        </Text>
                      <Text
                        style={{
                          ...Fonts.Medium14black,
                        }}
                      >
                        {entry.block_number || "A"}
                      </Text>
                    </View>
                  </View>

                  {/* Additional Details Section */}
                  {(hasContent(entry.entry_code) || hasContent(entry.created_at) || hasContent(entry.plate_number)) && (
                    <View
                      style={{
                        flexDirection: isRtl ? "row-reverse" : "row",
                        alignItems: "center",
                        marginVertical: Default.fixPadding * 2,
                        marginHorizontal: Default.fixPadding * 1.5,
                      }}
                    >


                                            {/* Entry Code Card */}
                      {hasContent(entry.entry_code) && (
                        <>
                          <View
                            style={{
                              flex: 1,
                              justifyContent: "center",
                              alignItems: "center",
                              paddingHorizontal: Default.fixPadding * 0.5,
                            }}
                          >
                            <View style={styles.circle}>
                              <MaterialCommunityIcons
                                name="key"
                                size={20}
                                color={Colors.primary}
                              />
                            </View>

                            <Text
                              numberOfLines={1}
                              style={{
                                ...Fonts.Medium14black,
                                overflow: "hidden",
                                marginTop: Default.fixPadding,
                              }}
                            >
                              Entry Code
                            </Text>
                            <Text
                              numberOfLines={1}
                              style={{
                                ...Fonts.Medium14black,
                              }}
                            >
                              {entry.entry_code}
                            </Text>
                          </View>
                        </>
                      )}



                      {/* Plate Number Card */}
                      {hasContent(entry.plate_number) && (
                        <>
                          {hasContent(entry.entry_code) && (
                            <View
                              style={{
                                height: 60,
                                borderLeftWidth: 1,
                                borderLeftColor: Colors.grey,
                              }}
                            />
                          )}
                          <View
                            style={{
                              flex: 1,
                              justifyContent: "center",
                              alignItems: "center",
                              paddingHorizontal: Default.fixPadding * 0.5,
                            }}
                          >
                            <View style={styles.circle}>
                              <MaterialCommunityIcons
                                name="card-text"
                                size={20}
                                color={Colors.primary}
                              />
                            </View>

                            <Text
                              numberOfLines={1}
                              style={{
                                ...Fonts.Medium14black,
                                overflow: "hidden",
                                marginTop: Default.fixPadding,
                              }}
                            >
                              Plate Number
                            </Text>
                            <Text
                              style={{
                                ...Fonts.Medium14black,
                              }}
                            >
                              {entry.plate_number}
                            </Text>
                          </View>
                        </>
                      )}

                      {/* Date Added Card */}
                      {hasContent(entry.created_at) && (
                        <>
                          {(hasContent(entry.entry_code) || hasContent(entry.plate_number)) && (
                            <View
                              style={{
                                height: 60,
                                borderLeftWidth: 1,
                                borderLeftColor: Colors.grey,
                              }}
                            />
                          )}
                          <View
                            style={{
                              flex: 1,
                              justifyContent: "center",
                              alignItems: "center",
                              paddingHorizontal: Default.fixPadding * 0.5,
                            }}
                          >
                            <View style={styles.circle}>
                              <MaterialCommunityIcons
                                name="calendar"
                                size={22}
                                color={Colors.primary}
                              />
                            </View>

                            <Text
                              numberOfLines={1}
                              style={{
                                ...Fonts.Medium14black,
                                overflow: "hidden",
                                marginTop: Default.fixPadding,
                              }}
                            >
                              Added On
                            </Text>
                            <Text
                              style={{
                                ...Fonts.Medium14black,
                              }}
                            >
                              {formatDate(entry.created_at)}
                            </Text>
                          </View>
                        </>
                      )}
                    </View>
                  )}
                </View>
              </ScrollView>

              {/* Action Buttons */}
              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
                  marginBottom: Default.fixPadding * 2.2,
                  marginHorizontal: Default.fixPadding * 1.3,
                }}
              >
                <TouchableOpacity
                  onPress={handleEdit}
                  style={{
                    flexDirection: isRtl ? "row-reverse" : "row",
                    backgroundColor: Colors.blue,
                    ...styles.button,
                  }}
                >
                  <AntDesign
                    name="edit"
                    size={20}
                    color={Colors.white}
                  />
                  <Text
                    numberOfLines={1}
                    style={{
                      ...Fonts.SemiBold18white,
                      overflow: "hidden",
                      marginLeft: isRtl ? 0 : Default.fixPadding,
                      marginRight: isRtl ? Default.fixPadding : 0,
                      maxWidth: 80,
                    }}
                  >
                    Edit
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleDelete}
                  style={{
                    flexDirection: isRtl ? "row-reverse" : "row",
                    backgroundColor: Colors.red,
                    ...styles.button,
                  }}
                >
                  <AntDesign
                    name="delete"
                    size={20}
                    color={Colors.white}
                  />
                  <Text
                    numberOfLines={1}
                    style={{
                      ...Fonts.SemiBold18white,
                      overflow: "hidden",
                      marginLeft: isRtl ? 0 : Default.fixPadding,
                      marginRight: isRtl ? Default.fixPadding : 0,
                      maxWidth: 80,
                    }}
                  >
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
    </Modal>
  );
};

export default EntryDetailModal; 
