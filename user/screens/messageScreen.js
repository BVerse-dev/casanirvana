import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  StyleSheet,
  Image,
  Dimensions,
  FlatList,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Alert,
  PermissionsAndroid,
  Linking,
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as LegacyFileSystem from 'expo-file-system/legacy';
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import MyStatusBar from "../components/myStatusBar";
import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import Octicons from "react-native-vector-icons/Octicons";
import moment from "moment";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useMessages, useRealTimeMessages } from "../hooks/useMessages";
import { useAuth } from "../contexts/AuthContext";
import { useUserStatus } from "../hooks/useUserStatus";
import { useCallsSubscription } from "../hooks/useCalls";
import { supabase } from "../utils/supabase";
import { buildStoredChatAttachment } from "../utils/chatAttachments";

const { width } = Dimensions.get("window");

const resolveAttachmentType = (mimeType = "") => {
  if (mimeType.startsWith("image/")) {
    return "image";
  }

  if (mimeType.startsWith("audio/")) {
    return "audio";
  }

  return "document";
};

const MessageScreen = ({ navigation, route }) => {
  const { image, name, key, phone, id, memberId, memberPhone, email } = route.params;

  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`messageScreen:${key}`);
  }

  // Use real messaging functionality with optimistic updates
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    markAsRead,
    isSending,
  } = useMessages(id || memberId);

  // Enable real-time message updates
  useRealTimeMessages(id || memberId);

  // Enable real-time call updates
  useCallsSubscription();

  // Get user's online status and last seen
  const { isOnline, statusText, isLoading: statusLoading } = useUserStatus(id || memberId);

  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // FlatList ref for auto-scrolling and recording reference
  const flatListRef = useRef(null);
  const textInputRef = useRef(null);
  const recordingRef = useRef(null);
  const recordingTimeoutRef = useRef(null);

  // Get current user profile at component level
  const { profile, user } = useAuth();
  const markedReadIdsRef = useRef(new Set());

  const backAction = () => {
    if (key === "2") {
      navigation.navigate("bottomTab", { screen: "homeScreen" });
    } else {
      navigation.pop();
    }
    return true;
  };

  useEffect(() => {
    const backHandlerListener = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => {
      backHandlerListener.remove();
    };
  }, []);

  // Cleanup recording on component unmount
  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        try {
          recordingRef.current.stopAndUnloadAsync();
        } catch (error) {
          console.log('Cleanup on unmount error (non-critical):', error);
        }
      }
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
    };
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current && (messages?.length || 0) > 0) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 50);
    }
  }, [messages?.length]);

  // Mark incoming unread messages as read once they are rendered.
  useEffect(() => {
    if (!profile?.id || !Array.isArray(messages) || messages.length === 0) {
      return;
    }

    messages.forEach((msg) => {
      const idValue = typeof msg.id === "string" ? msg.id : "";
      if (!idValue || idValue.startsWith("temp-")) return;
      if (msg.to_user !== profile.id) return;

      const isRead = msg.is_read ?? msg.read ?? false;
      if (isRead) return;
      if (markedReadIdsRef.current.has(idValue)) return;

      markedReadIdsRef.current.add(idValue);
      markAsRead(idValue);
    });
  }, [messages, markAsRead, profile?.id]);

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, []);

  // Upload file to Supabase Storage
  const uploadFileToSupabase = useCallback(async (fileUri, fileName, mimeType) => {
    try {
      setIsUploading(true);

      const readAsStringAsync = LegacyFileSystem.readAsStringAsync;
      const base64Encoding = LegacyFileSystem.EncodingType?.Base64 || 'base64';

      if (!readAsStringAsync) {
        throw new Error('FileSystem readAsStringAsync is not available in this runtime');
      }

      // Read file as base64
      const fileBase64 = await readAsStringAsync(fileUri, {
        encoding: base64Encoding,
      });
      
      // Convert base64 to ArrayBuffer (React Native compatible)
      const binaryString = atob(fileBase64);
      const arrayBuffer = new ArrayBuffer(binaryString.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }
      
      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = fileName.split('.').pop();
      const ownerFolderId = user?.id || profile?.user_id || profile?.id;
      if (!ownerFolderId) {
        throw new Error("Unable to resolve upload owner for attachment.");
      }

      const uniqueFileName = `${ownerFolderId}/chat/${timestamp}-${fileName}`;
      
      // Upload to Supabase Storage using ArrayBuffer
      const { error } = await supabase.storage
        .from('chat-attachments')
        .upload(uniqueFileName, arrayBuffer, {
          contentType: mimeType,
        });
      
      if (error) {
        throw error;
      }
      
      return {
        ...buildStoredChatAttachment(
          {
            path: uniqueFileName,
            url: fileUri,
            fileName,
            fileSize: arrayBuffer.byteLength,
            mimeType,
          },
          resolveAttachmentType(mimeType)
        ),
        url: fileUri,
      };
      
    } catch (error) {
      console.error('File upload error:', error);
      Alert.alert('Upload Error', 'Failed to upload file. Please try again.');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [profile?.id, profile?.user_id, user?.id]);

  // Handle attachment selection
  const handleAttachment = () => {
    Alert.alert(
      "Attachment Options",
      "Choose attachment type",
      [
        {
          text: "Camera",
          onPress: handleCamera,
        },
        {
          text: "Gallery", 
          onPress: handleGallery,
        },
        {
          text: "Document",
          onPress: handleDocument,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const handleCamera = useCallback(async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera permission is required to take photos. Please enable it in settings.',
          [
            { text: 'Cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Upload to Supabase
        const uploadResult = await uploadFileToSupabase(
          asset.uri,
          `photo_${Date.now()}.jpg`,
          'image/jpeg'
        );

        if (uploadResult) {
          // Send image message
          await sendMessage({
            toUserId: id || memberId,
            content: 'Photo',
            messageType: 'image',
            attachments: uploadResult
          });
        }
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  }, [uploadFileToSupabase, sendMessage, id, memberId]);

  const handleGallery = useCallback(async () => {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Photo library permission is required to select images. Please enable it in settings.',
          [
            { text: 'Cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Upload to Supabase
        const uploadResult = await uploadFileToSupabase(
          asset.uri,
          asset.fileName || `image_${Date.now()}.jpg`,
          asset.mimeType || 'image/jpeg'
        );

        if (uploadResult) {
          // Send image message
          await sendMessage({
            toUserId: id || memberId,
            content: 'Image',
            messageType: 'image',
            attachments: uploadResult
          });
        }
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  }, [uploadFileToSupabase, sendMessage, id, memberId]);

  const handleDocument = useCallback(async () => {
    try {
      // Launch document picker
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Check file size (limit to 10MB)
        if (asset.size > 10 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Please select a file smaller than 10MB.');
          return;
        }
        
        // Upload to Supabase
        const uploadResult = await uploadFileToSupabase(
          asset.uri,
          asset.name,
          asset.mimeType || 'application/octet-stream'
        );

        if (uploadResult) {
          // Send document message
          await sendMessage({
            toUserId: id || memberId,
            content: `Document: ${asset.name}`,
            messageType: 'document',
            attachments: uploadResult
          });
        }
      }
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Failed to select document. Please try again.');
    }
  }, [uploadFileToSupabase, sendMessage, id, memberId]);

  // Handle voice recording start (WhatsApp-like press and hold)
  const startVoiceRecording = useCallback(async () => {
    // Prevent starting if already recording
    if (isRecording || recordingRef.current) {
      return;
    }

    try {
      // Clean up any existing recording first
      if (recordingRef.current) {
        try {
          await recordingRef.current.stopAndUnloadAsync();
        } catch (cleanupError) {
          console.log('Cleanup error (non-critical):', cleanupError);
        }
        recordingRef.current = null;
      }

      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Microphone permission is required for voice messages. Please enable it in settings.',
          [
            { text: 'Cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }

      // Configure audio session
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
      });

      recordingRef.current = recording;
      setIsRecording(true);

      // Auto-stop recording after 60 seconds
      recordingTimeoutRef.current = setTimeout(() => {
        stopVoiceRecording();
      }, 60000);

    } catch (error) {
      console.error('Recording start error:', error);
      Alert.alert('Error', 'Failed to start voice recording. Please try again.');
      setIsRecording(false);
    }
  }, []);

  // Handle voice recording stop and send
  const stopVoiceRecording = useCallback(async () => {
    if (!isRecording || !recordingRef.current) {
      return;
    }

    try {
      setIsRecording(false);
      
      // Clear the timeout
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = null;
      }
      
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      
      if (uri) {
        // Upload audio file
        const uploadResult = await uploadFileToSupabase(
          uri,
          `voice_${Date.now()}.m4a`,
          'audio/m4a'
        );

        if (uploadResult) {
          // Send voice message
          await sendMessage({
            toUserId: id || memberId,
            content: 'Voice message',
            messageType: 'audio',
            attachments: uploadResult
          });
        }
      }
      
      recordingRef.current = null;
    } catch (error) {
      console.error('Recording stop error:', error);
      Alert.alert('Error', 'Failed to save voice message. Please try again.');
      setIsRecording(false);
    }
  }, [isRecording, uploadFileToSupabase, sendMessage, id, memberId]);

  // Handle voice recording cancel (if user slides away)
  const cancelVoiceRecording = useCallback(async () => {
    if (!isRecording || !recordingRef.current) {
      return;
    }

    try {
      setIsRecording(false);
      
      // Clear the timeout
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = null;
      }
      
      await recordingRef.current.stopAndUnloadAsync();
      recordingRef.current = null;
    } catch (error) {
      console.error('Recording cancel error:', error);
      setIsRecording(false);
    }
  }, [isRecording]);

  // Handle sending messages
  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || isSending) {
      return;
    }

    const messageToSend = message.trim();
    setMessage(""); // Clear input immediately for better UX

    try {
      const toUserId = id || memberId;
      
      if (!toUserId) {
        Alert.alert('Error', 'Cannot send message: recipient not found');
        setMessage(messageToSend); // Restore message on error
        return;
      }
      
      // Send message with optimistic updates - will appear immediately
      await sendMessage({
        toUserId: toUserId,
        content: messageToSend,
        messageType: 'text',
      });
      
      // Auto-scroll to bottom after sending message
      scrollToBottom();
      
    } catch (error) {
      console.error('Error sending message:', error);
      // Show the actual error message for debugging
      Alert.alert('Error', error.message || 'Failed to send message. Please try again.');
      setMessage(messageToSend); // Restore message on error
    }
  }, [message, isSending, id, memberId, sendMessage, scrollToBottom]);

  // Transform messages for display
  const transformedMessages = (messages || []).map((msg, index) => {
    const isMe = msg.from_user === profile?.id;
    
    // Parse message body if it contains JSON (for attachments or calls)
    let messageContent = msg.body;
    let messageType = 'text';
    let attachments = null;
    let messageStatus = 'sent';
    
    // Check if message is from optimistic update (has temporary fields)
    if (msg._messageType) {
      messageType = msg._messageType;
      attachments = msg._attachments || msg._callData;
      messageStatus = msg._status || 'sent';
    } else if (msg._isCall) {
      // Handle call records
      messageType = 'call';
      // Use _callData if available, otherwise try to parse from body
      attachments = msg._callData || (msg.body && msg.body.startsWith('{') ? JSON.parse(msg.body) : { type: 'call', call_type: 'voice', status: 'ended' });
    } else if (msg.message_type === 'file' && msg.attachments) {
      messageType = msg.attachments.type || 'document';
      attachments = msg.attachments;
      messageContent = msg.body || msg.attachments.fileName || 'Attachment';
    } else {
      // Try to parse JSON from body for stored messages
      try {
        const parsed = JSON.parse(msg.body);
        if (parsed.type && (parsed.attachment || parsed.call_type)) {
          messageType = parsed.type;
          messageContent = parsed.content || 'Call';
          attachments = parsed.attachment || parsed;
        }
      } catch (e) {
        // Not JSON, treat as plain text
        messageContent = msg.body;
      }
    }
    
    return {
      key: msg.id,
      txtMsg: messageContent,
      msgTime: moment(msg.sent_at).format("h:mm A"),
      isMe: isMe,
      messageStatus: msg.message_status || messageStatus,
      isRead: msg.is_read ?? msg.read ?? false,
      messageType: messageType,
      attachments: attachments,
    };
  });

  // Function to get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'sending':
        return <Ionicons name="time-outline" size={12} color={Colors.grey} />;
      case 'sent':
        return <Ionicons name="checkmark" size={12} color={Colors.grey} />;
      case 'delivered':
        return <Ionicons name="checkmark-done" size={12} color={Colors.grey} />;
      case 'read':
        return <Ionicons name="checkmark-done" size={12} color={Colors.blue} />;
      default:
        return null;
    }
  };

  // Handle calling from message screen
  const handleCall = () => {
    navigation.push("callScreen", {
      image,
      name,
      phone: phone || memberPhone,
      id: id || memberId,
      memberId,
      memberPhone,
    });
  };

  // Use real messages or fallback to demo data if no real messages
  const displayData = transformedMessages && transformedMessages.length > 0 ? transformedMessages : [
    {
      key: 8,
      txtMsg: "Welcome! Start a conversation.",
      msgTime: moment().format("h:mm A"),
      isMe: false,
    },
  ];

  const handleMsgSend = useCallback(() => {
    handleSendMessage();
  }, [handleSendMessage]);

  // Render message content based on type
  const renderMessageContent = (item) => {
    switch (item.messageType) {
      case 'call':
        let callData;
        try {
          // Get call data from attachments or try parsing txtMsg
          callData = item.attachments || (item.txtMsg && item.txtMsg.startsWith('{') ? JSON.parse(item.txtMsg) : null);
        } catch (e) {
          callData = null;
        }
        
        // Fallback to default call data if parsing failed
        if (!callData) {
          callData = { type: 'call', call_type: 'voice', status: 'ended' };
        }

          const isOutgoing = item.isMe;
          const isMissed = callData.status === 'missed' || (callData.status === 'ended' && !callData.answered_at);
          const isAnswered = callData.answered_at !== null;
          const duration = callData.duration_seconds || 0;

          // Format duration
          const formatDuration = (seconds) => {
            if (seconds < 60) return `${seconds}s`;
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
          };

          // WhatsApp-like call display
          let callTitle = `${callData.call_type === 'video' ? 'Video' : 'Voice'} call`;
          let callStatus = '';
          let iconName = callData.call_type === 'video' ? 'videocam' : 'call';
          let iconColor = item.isMe ? Colors.white : Colors.primary;
          let arrowIconName = '';

          if (isOutgoing) {
            arrowIconName = 'trending-up'; // Outgoing call arrow (↗)
            if (isMissed) {
              callStatus = 'No answer';
              iconColor = '#ff6b6b';
            } else if (isAnswered && duration > 0) {
              callStatus = formatDuration(duration);
              iconColor = '#4CAF50';
            } else {
              callStatus = 'Outgoing';
              iconColor = item.isMe ? Colors.white : Colors.primary;
            }
          } else {
            arrowIconName = 'trending-down'; // Incoming call arrow (↙)
            if (isMissed) {
              callStatus = 'Missed';
              iconColor = '#ff6b6b';
            } else if (isAnswered && duration > 0) {
              callStatus = formatDuration(duration);
              iconColor = '#4CAF50';
            } else {
              callStatus = 'Incoming';
              iconColor = item.isMe ? Colors.white : Colors.primary;
            }
          }

          return (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'transparent',
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 8,
                minWidth: 160,
                borderWidth: 1,
                borderColor: item.isMe ? 'rgba(255,255,255,0.3)' : 'rgba(14, 52, 76, 0.15)',
              }}
            >
              {/* Circular icon background like WhatsApp */}
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: item.isMe ? 'rgba(255,255,255,0.2)' : 'rgba(14, 52, 76, 0.1)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                }}
              >
                <Ionicons 
                  name={iconName}
                  size={16} 
                  color={iconColor}
                />
              </View>
              
              {/* Text content with title and status */}
              <View style={{ flex: 1 }}>
                <Text style={{
                  ...Fonts.SemiBold14primary,
                  color: item.isMe ? Colors.white : Colors.primary,
                  fontSize: 14,
                  fontWeight: '600',
                }}>
                  {callTitle}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  <Ionicons 
                    name={arrowIconName}
                    size={12} 
                    color={item.isMe ? 'rgba(255,255,255,0.7)' : Colors.grey}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={{
                    ...Fonts.Regular12grey,
                    color: item.isMe ? 'rgba(255,255,255,0.7)' : Colors.grey,
                    fontSize: 12,
                  }}>
                    {callStatus}
                  </Text>
                </View>
              </View>
            </View>
          );

      case 'image':
        if (item.attachments?.url) {
          return (
            <TouchableOpacity
              onPress={() => {
                Alert.alert('Image', 'Image preview functionality can be enhanced with a full-screen viewer.');
              }}
            >
              <Image
                source={{ uri: item.attachments.url }}
                style={{
                  width: 200,
                  height: 150,
                  borderRadius: 10,
                  resizeMode: 'cover'
                }}
                onError={() => {
                  console.log('Failed to load image:', item.attachments.url);
                }}
              />
            </TouchableOpacity>
          );
        }
        break;

      case 'audio':
        if (item.attachments?.url) {
          return (
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: item.isMe ? 'rgba(255,255,255,0.2)' : 'rgba(14, 52, 76, 0.1)',
                padding: Default.fixPadding,
                borderRadius: 10,
                minWidth: 150,
              }}
              onPress={() => {
                Alert.alert('Voice Message', 'Audio playback functionality will be enhanced with audio controls.');
              }}
            >
              <Ionicons 
                name="play-circle" 
                size={24} 
                color={item.isMe ? Colors.white : Colors.primary} 
              />
              <View style={{ marginLeft: 8, flex: 1 }}>
                <Text style={{
                  ...Fonts.SemiBold12white,
                  color: item.isMe ? Colors.white : Colors.primary
                }}>
                  Voice message
                </Text>
                <Text style={{
                  ...Fonts.Regular10grey,
                  color: item.isMe ? 'rgba(255,255,255,0.7)' : Colors.grey
                }}>
                  Tap to play
                </Text>
              </View>
            </TouchableOpacity>
          );
        }
        break;

      case 'document':
        if (item.attachments?.url) {
          return (
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: item.isMe ? 'rgba(255,255,255,0.2)' : 'rgba(14, 52, 76, 0.1)',
                padding: Default.fixPadding,
                borderRadius: 10,
                minWidth: 180,
              }}
              onPress={() => {
                Linking.openURL(item.attachments.url).catch(() => {
                  Alert.alert('Error', 'Unable to open document.');
                });
              }}
            >
              <Ionicons 
                name="document-text" 
                size={24} 
                color={item.isMe ? Colors.white : Colors.primary} 
              />
              <View style={{ marginLeft: 8, flex: 1 }}>
                <Text 
                  style={{
                    ...Fonts.SemiBold12white,
                    color: item.isMe ? Colors.white : Colors.primary
                  }}
                  numberOfLines={1}
                >
                  {item.attachments.fileName || 'Document'}
                </Text>
                <Text style={{
                  ...Fonts.Regular10grey,
                  color: item.isMe ? 'rgba(255,255,255,0.7)' : Colors.grey
                }}>
                  {item.attachments.fileSize ? `${Math.round(item.attachments.fileSize / 1024)} KB` : 'Tap to open'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }
        break;

      default:
        return (
          <Text
            style={{
              flex: 1,
              ...(item.isMe ? Fonts.SemiBold14white : Fonts.SemiBold14primary),
            }}
          >
            {item.txtMsg}
          </Text>
        );
    }

    // Fallback for text or invalid attachments
    return (
      <Text
        style={{
          flex: 1,
          ...(item.isMe ? Fonts.SemiBold14white : Fonts.SemiBold14primary),
        }}
      >
        {item.txtMsg}
      </Text>
    );
  };

  const renderItem = ({ item, index }) => {
    return (
      <View style={{ marginHorizontal: Default.fixPadding * 2 }}>
        {item.isMe ? (
          <View
            key={index}
            style={{
              alignItems: isRtl ? "flex-start" : "flex-end",
              marginBottom: Default.fixPadding * 2,
            }}
          >
            <View
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
              }}
            >
              <View>
                <View
                  style={{
                    borderBottomLeftRadius: isRtl ? 0 : 10,
                    borderBottomRightRadius: isRtl ? 10 : 0,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                    padding: item.messageType === 'text' ? Default.fixPadding : 4,
                    backgroundColor: Colors.primary,
                    ...Default.shadow,
                    maxWidth: width * 0.7,
                  }}
                >
                  {renderMessageContent(item)}
                </View>
                <View
                  style={{
                    flexDirection: isRtl ? "row-reverse" : "row",
                    alignItems: "center",
                    justifyContent: isRtl ? "flex-start" : "flex-end",
                    marginTop: Default.fixPadding * 0.3,
                  }}
                >
                  <Text
                    style={{
                      ...Fonts.SemiBold12grey,
                      textAlign: isRtl ? "left" : "right",
                    }}
                  >
                    {item.msgTime}
                  </Text>
                  {item.isMe && (
                    <View style={{ marginLeft: 4 }}>
                      {getStatusIcon(item.messageStatus)}
                    </View>
                  )}
                </View>
              </View>
              <Image
                source={require("../assets/images/pic1.png")}
                style={{
                  marginLeft: isRtl ? 0 : Default.fixPadding * 0.5,
                  marginRight: isRtl ? Default.fixPadding * 0.5 : 0,
                  ...styles.messageCircleImgStyle,
                }}
              />
            </View>
          </View>
        ) : (
          <View
            key={index}
            style={{
              marginBottom: Default.fixPadding * 3,
              marginTop: Default.fixPadding * 2,
            }}
          >
            <View
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
              }}
            >
              <Image
                source={image}
                style={{
                  marginRight: isRtl ? 0 : Default.fixPadding * 0.5,
                  marginLeft: isRtl ? Default.fixPadding * 0.5 : 0,
                  ...styles.messageCircleImgStyle,
                }}
              />

              <View>
                <View
                  style={{
                    borderBottomRightRadius: isRtl ? 0 : 10,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                    borderBottomLeftRadius: isRtl ? 10 : 0,
                    maxWidth: width * 0.7,
                    padding: item.messageType === 'text' ? Default.fixPadding : 4,
                    backgroundColor: "rgba(14, 52, 76, 0.1)",
                  }}
                >
                  {renderMessageContent(item)}
                </View>
                <Text
                  style={{
                    textAlign: isRtl ? "right" : "left",
                    ...Fonts.SemiBold12grey,
                    marginTop: Default.fixPadding * 0.3,
                  }}
                >
                  {item.msgTime}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  const chatContainer = () => {
    return (
      <FlatList
        data={displayData}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.key.toString()}
        contentContainerStyle={{ paddingBottom: Default.fixPadding }}
        ref={flatListRef}
        onContentSizeChange={() => {
          // Auto-scroll to bottom when content size changes (new messages)
          scrollToBottom();
        }}
        onLayout={() => {
          // Auto-scroll to bottom on initial layout
          setTimeout(() => scrollToBottom(), 100);
        }}
      />
    );
  };

  const bottomTextInputAndSend = () => {
    return (
      <View>
        {/* Upload Status Indicator */}
        {isUploading && (
          <View style={styles.uploadingIndicator}>
            <Ionicons name="cloud-upload" size={16} color={Colors.primary} />
            <Text style={styles.uploadingText}>Uploading file...</Text>
          </View>
        )}
        
        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            ...styles.bottomMainViewStyle,
          }}
        >
        <View
          style={{
            flex: 1,
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
            marginRight: isRtl ? 0 : Default.fixPadding * 1.5,
            marginLeft: isRtl ? Default.fixPadding * 1.5 : 0,
          }}
        >
          <TouchableOpacity>
            <Octicons name="smiley" size={20} color={Colors.primary} />
          </TouchableOpacity>
          
          <TextInput
            ref={textInputRef}
            value={message}
            onChangeText={setMessage}
            placeholder={tr("typeHere")}
            placeholderTextColor={Colors.primary}
            selectionColor={Colors.primary}
            style={{
              flex: 1,
              ...Fonts.Regular14primary,
              textAlign: isRtl ? "right" : "left",
              marginHorizontal: Default.fixPadding,
            }}
            onFocus={scrollToBottom}
          />
          
          <TouchableOpacity 
            onPress={handleAttachment}
            style={{
              padding: 4,
              marginRight: isRtl ? 0 : Default.fixPadding * 0.5,
              marginLeft: isRtl ? Default.fixPadding * 0.5 : 0,
            }}
          >
            <Feather name="paperclip" size={20} color={Colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPressIn={startVoiceRecording}
            onPressOut={stopVoiceRecording}
            onLongPress={() => {}} // Prevent default long press
            delayLongPress={200}
            style={{
              padding: 8,
              marginLeft: isRtl ? 0 : Default.fixPadding * 0.5,
              marginRight: isRtl ? Default.fixPadding * 0.5 : 0,
              backgroundColor: isRecording ? Colors.red : 'transparent',
              borderRadius: isRecording ? 20 : 0,
              transform: [{ scale: isRecording ? 1.2 : 1 }],
            }}
          >
            <Feather
              name="mic"
              size={20}
              color={isRecording ? Colors.white : Colors.primary}
            />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          disabled={!message.trim() || isSending || isUploading}
          onPress={handleMsgSend}
          style={[
            styles.sendTouchableStyle,
            {
              opacity: (!message.trim() || isSending || isUploading) ? 0.5 : 1,
            }
          ]}
        >
          {(isSending || isUploading) ? (
            <Ionicons name="time" size={20} color={Colors.primary} />
          ) : (
            <Ionicons name="send" size={20} color={Colors.primary} />
          )}
        </TouchableOpacity>
      </View>
    </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <MyStatusBar />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
            marginVertical: Default.fixPadding * 1.2,
            marginHorizontal: Default.fixPadding * 2,
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: isRtl ? "row-reverse" : "row",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              onPress={() => {
                if (key === "2") {
                  navigation.navigate("bottomTab", { screen: "homeScreen" });
                } else {
                  navigation.pop();
                }
              }}
            >
              <Ionicons
                name={isRtl ? "arrow-forward-outline" : "arrow-back-outline"}
                size={25}
                color={Colors.black}
              />
            </TouchableOpacity>

            <Image
              source={image || { uri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin' }}
              style={{
                resizeMode: "cover",
                width: 42,
                height: 42,
                borderRadius: 21,
                marginLeft: isRtl ? 0 : Default.fixPadding * 1.7,
                marginRight: isRtl ? Default.fixPadding * 1.7 : 0,
              }}
            />
            {/* Online status indicator on profile picture */}
            {isOnline && (
              <View
                style={{
                  position: 'absolute',
                  bottom: 2,
                  right: isRtl ? undefined : 2,
                  left: isRtl ? 2 : undefined,
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: Colors.green || '#4CAF50',
                  borderWidth: 2,
                  borderColor: Colors.white,
                  marginLeft: isRtl ? 0 : Default.fixPadding * 1.7,
                  marginRight: isRtl ? Default.fixPadding * 1.7 : 0,
                }}
              />
            )}
            <View
              style={{
                flex: 1,
                alignItems: isRtl ? "flex-end" : "flex-start",
                marginHorizontal: Default.fixPadding,
              }}
            >
              <Text
                numberOfLines={1}
                style={{ ...Fonts.SemiBold16black, overflow: "hidden" }}
              >
                {name}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  ...Fonts.SemiBold14grey,
                  overflow: "hidden",
                  marginTop: Default.fixPadding * 0.5,
                  color: isOnline ? Colors.green || '#4CAF50' : Colors.grey,
                }}
              >
                {statusLoading ? "Loading..." : statusText}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleCall}
          >
            <MaterialCommunityIcons
              name="phone-outline"
              size={22}
              color={Colors.primary}
            />
          </TouchableOpacity>
        </View>

        {chatContainer()}
        {bottomTextInputAndSend()}
      </KeyboardAvoidingView>
    </View>
  );
};

export default MessageScreen;

const styles = StyleSheet.create({
  sendTouchableStyle: {
    justifyContent: "center",
    alignItems: "center",
    width: 37,
    height: 37,
    borderRadius: 18.5,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },

  bottomMainViewStyle: {
    alignItems: "center",
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 1.2,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  
  uploadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(14, 52, 76, 0.1)',
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 0.8,
  },
  
  uploadingText: {
    ...Fonts.Regular12primary,
    marginLeft: Default.fixPadding * 0.5,
  },
  
  messageCircleImgStyle: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    alignSelf: "flex-end",
  },
});
