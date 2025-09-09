import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import MyStatusBar from "../components/myStatusBar";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import useGuardAssignment from "../hooks/useGuardAssignment";
import { supabase } from "../utils/supabase";
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const AssignmentScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [guardProfile, setGuardProfile] = useState(null);

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`assignmentScreen:${key}`);
  }

  // Get current user ID from session and guard profile
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCurrentUserId(session.user.id);
          
          // Fetch guard profile
          const { data: guards, error } = await supabase
            .from('guards')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
            
          if (guards) {
            setGuardProfile(guards);
          }
        }
      } catch (error) {
        console.error('Error getting current user:', error);
      }
    };
    getCurrentUser();
  }, []);

  const { assignment, loading: assignmentLoading, error: assignmentError } = useGuardAssignment();

  // Format shift type with proper capitalization
  const formatShiftType = (shift) => {
    if (!shift) return '-';
    return shift.charAt(0).toUpperCase() + shift.slice(1).toLowerCase();
  };

  const renderInfoCard = (title, icon, iconColor, children) => (
    <View style={{
      marginTop: Default.fixPadding * 2,
      marginHorizontal: Default.fixPadding * 2,
      padding: Default.fixPadding * 2,
      borderRadius: 10,
      backgroundColor: Colors.white,
      borderWidth: 1,
      borderColor: Colors.lightSky,
      ...Default.shadow,
    }}>
      <View style={{ 
        flexDirection: "row", 
        alignItems: "center", 
        marginBottom: Default.fixPadding * 1.5 
      }}>
        <Ionicons name={icon} size={24} color={iconColor} />
        <Text style={{ 
          ...Fonts.SemiBold18primary, 
          marginLeft: Default.fixPadding * 0.8,
          color: iconColor
        }}>
          {title}
        </Text>
      </View>
      {children}
    </View>
  );

  const renderInfoRow = (icon, label, value, iconColor = Colors.grey) => (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: Default.fixPadding * 0.8 }}>
      <Ionicons name={icon} size={18} color={iconColor} />
      <Text style={{ ...Fonts.Medium16black, marginLeft: Default.fixPadding * 0.8 }}>
        {label}: {value || '-'}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.lightGrey }}>
      <MyStatusBar />
      <View
        style={{
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "center",
          paddingHorizontal: Default.fixPadding * 2,
          paddingVertical: Default.fixPadding * 1.2,
          backgroundColor: Colors.white,
        }}
      >
        <TouchableOpacity onPress={() => navigation.pop()}>
          <Ionicons
            name={isRtl ? "chevron-forward" : "chevron-back"}
            size={25}
            color={Colors.black}
          />
        </TouchableOpacity>
        <Text
          style={{
            ...Fonts.SemiBold18black,
            textAlign: isRtl ? "right" : "left",
            marginHorizontal: Default.fixPadding,
          }}
        >
          Assignment Details
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {assignmentLoading ? (
          <View style={{
            marginTop: Default.fixPadding * 4,
            alignItems: "center"
          }}>
            <Text style={Fonts.Medium16grey}>Loading assignment details...</Text>
          </View>
        ) : assignmentError ? (
          <View style={{
            marginTop: Default.fixPadding * 4,
            alignItems: "center"
          }}>
            <Text style={Fonts.Medium16grey}>Error loading assignment details</Text>
          </View>
        ) : !assignment ? (
          <View style={{
            marginTop: Default.fixPadding * 4,
            alignItems: "center"
          }}>
            <Text style={Fonts.Medium16grey}>No active assignment found</Text>
          </View>
        ) : (
          <>
            {/* Current Assignment Card */}
            <View style={{
              marginTop: Default.fixPadding * 2,
              marginHorizontal: Default.fixPadding * 2,
              padding: Default.fixPadding * 2,
              borderRadius: 10,
              backgroundColor: Colors.white,
              borderWidth: 1,
              borderColor: Colors.lightSky,
              ...Default.shadow,
            }}>
              <View style={{ 
                flexDirection: "row", 
                alignItems: "center", 
                marginBottom: Default.fixPadding * 1.5 
              }}>
                <Ionicons name="briefcase" size={24} color={Colors.primary} />
                <Text style={{ 
                  ...Fonts.SemiBold18primary, 
                  marginLeft: Default.fixPadding * 0.8 
                }}>
                  Current Assignment
                </Text>
              </View>
              
              {renderInfoRow("time", "Shift", formatShiftType(assignment?.shiftType))}
              {renderInfoRow("business-outline", "Gate", assignment?.gate, Colors.blue)}
              {renderInfoRow("location", "Society", assignment?.society, Colors.orange)}
              
              <View style={{ 
                flexDirection: "row", 
                alignItems: "center", 
                marginTop: Default.fixPadding,
                marginBottom: Default.fixPadding * 1.2 
              }}>
                <Ionicons name="stats-chart" size={24} color={Colors.primary} />
                <Text style={{ 
                  ...Fonts.SemiBold18primary, 
                  marginLeft: Default.fixPadding * 0.8 
                }}>
                  Performance Metrics
                </Text>
              </View>
              
              {renderInfoRow("checkmark-circle", "Attendance Rate", `${assignment?.KPIs?.attendance ?? '-'}%`, Colors.green)}
              {renderInfoRow("alarm", "On-Time Performance", `${assignment?.KPIs?.punctuality ?? '-'}%`, Colors.blue)}
              {renderInfoRow("star", "Overall Rating", `${assignment?.KPIs?.performance ?? '-'}/5`, Colors.orange)}
            </View>

            {/* Professional Information Card */}
            {guardProfile && renderInfoCard("Professional Information", "shield-checkmark", Colors.purple, (
              <>
                {renderInfoRow("id-card", "Employee ID", guardProfile.employee_id)}
                {renderInfoRow("document-text", "License Number", guardProfile.license_number)}
                {renderInfoRow("time", "Experience", `${guardProfile.experience_years || 0} years`)}
                {renderInfoRow("location", "Gate Assignment", guardProfile.gate_assignment)}
                {renderInfoRow("time-outline", "Shift Hours", 
                  guardProfile.shift_start_time && guardProfile.shift_end_time 
                    ? `${guardProfile.shift_start_time} - ${guardProfile.shift_end_time}`
                    : 'Not set'
                )}
              </>
            ))}

            {/* Performance & Metrics Card */}
            {guardProfile && renderInfoCard("Performance Summary", "analytics", Colors.blue, (
              <>
                {renderInfoRow("briefcase", "Total Shifts", `${guardProfile.total_shifts || 0}`, Colors.blue)}
                {renderInfoRow("checkmark-circle", "Completed Shifts", `${guardProfile.completed_shifts || 0}`, Colors.green)}
                {renderInfoRow("star", "Rating", `${guardProfile.rating ? parseFloat(guardProfile.rating).toFixed(1) : '0.0'}/5`, Colors.orange)}
                {renderInfoRow("trending-up", "Attendance Rate", 
                  guardProfile.total_shifts > 0 
                    ? `${((guardProfile.completed_shifts / guardProfile.total_shifts) * 100).toFixed(1)}%`
                    : '0%', 
                  Colors.green
                )}
              </>
            ))}

            {/* Emergency Information Card */}
            {guardProfile && renderInfoCard("Emergency Information", "medical", Colors.red, (
              <>
                {renderInfoRow("person", "Emergency Contact", guardProfile.emergency_contact_name)}
                {renderInfoRow("call", "Contact Phone", guardProfile.emergency_contact_phone)}
                {renderInfoRow("home", "Address", guardProfile.address)}
              </>
            ))}

            {/* Certifications & Skills Card */}
            {guardProfile && renderInfoCard("Certifications & Skills", "school", Colors.blue, (
              <>
                <View style={{ marginBottom: Default.fixPadding }}>
                  <Text style={{...Fonts.SemiBold16grey, marginBottom: Default.fixPadding * 0.5}}>
                    Certifications:
                  </Text>
                  {guardProfile.certifications && guardProfile.certifications.length > 0 ? (
                    guardProfile.certifications.map((cert, index) => (
                      <View key={index} style={{ 
                        flexDirection: "row", 
                        alignItems: "center", 
                        marginBottom: Default.fixPadding * 0.3 
                      }}>
                        <Ionicons name="checkmark-circle" size={16} color={Colors.green} />
                        <Text style={{ ...Fonts.Medium14grey, marginLeft: Default.fixPadding * 0.5 }}>
                          {cert}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={{...Fonts.Medium14grey, fontStyle: 'italic'}}>
                      No certifications recorded
                    </Text>
                  )}
                </View>
                
                <View>
                  <Text style={{...Fonts.SemiBold16grey, marginBottom: Default.fixPadding * 0.5}}>
                    Skills:
                  </Text>
                  {guardProfile.skills && guardProfile.skills.length > 0 ? (
                    guardProfile.skills.map((skill, index) => (
                      <View key={index} style={{ 
                        flexDirection: "row", 
                        alignItems: "center", 
                        marginBottom: Default.fixPadding * 0.3 
                      }}>
                        <Ionicons name="star" size={16} color={Colors.orange} />
                        <Text style={{ ...Fonts.Medium14grey, marginLeft: Default.fixPadding * 0.5 }}>
                          {skill}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={{...Fonts.Medium14grey, fontStyle: 'italic'}}>
                      No skills recorded
                    </Text>
                  )}
                </View>
              </>
            ))}
          </>
        )}
        
        {/* Add some bottom padding */}
        <View style={{ height: Default.fixPadding * 2 }} />
      </ScrollView>
    </View>
  );
};

export default AssignmentScreen;
