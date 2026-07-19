import React, { useState } from "react";
import { View, Modal, TouchableOpacity, SafeAreaView } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Colors, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import { CameraView } from "expo-camera";

const CameraModule = (props) => {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() == "rtl";

  const [type, setType] = useState('back');
  const [cameraRef, setCameraRef] = useState(null);

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="slide"
      onRequestClose={() => props.setShowCamera()}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <CameraView
            ratio="16:9"
            facing={type}
            ref={(ref) => setCameraRef(ref)}
            style={{ flex: 1 }}
          />
          
          {/* Overlay UI positioned absolutely over the camera */}
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: Colors.black,
            }}
          >
            <View
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: Default.fixPadding * 1.5,
                paddingHorizontal: Default.fixPadding * 2,
              }}
            >
            <TouchableOpacity
              onPress={() => {
                props.setShowCamera();
                props.closeBottomSheet();
              }}
            >
              <Ionicons name="close" color={Colors.white} size={30} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                if (cameraRef) {
                  let photo = await cameraRef.takePictureAsync();
                  props.setPickedImage(photo);
                  props.setShowCamera();
                  props.closeBottomSheet();
                }
              }}
            >
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  height: 50,
                  width: 50,
                  borderRadius: 25,
                  borderWidth: 2,
                  borderColor: Colors.white,
                }}
              >
                <View
                  style={{
                    height: 40,
                    width: 40,
                    borderRadius: 20,
                    backgroundColor: Colors.white,
                  }}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setType(
                  type === 'back'
                    ? 'front'
                    : 'back'
                );
              }}
            >
              <Ionicons
                name="camera-reverse-outline"
                size={30}
                color={Colors.white}
              />
            </TouchableOpacity>
          </View>
        </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default CameraModule;
