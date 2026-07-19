import React, { useRef, useState } from "react";
import { View, Modal, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Colors, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import { CameraView } from "expo-camera";

const CameraModule = (props) => {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() == "rtl";

  const [facing, setFacing] = useState('back');
  const cameraRef = useRef(null);

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="slide"
      onRequestClose={() => props.setShowCamera()}
    >
      <CameraView
        // ratio prop is not required with CameraView
        facing={facing}
        ref={cameraRef}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: Colors.transparent,
          }}
        >
          <View
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: Default.fixPadding * 2,
              paddingVertical: Default.fixPadding * 1.5,
              backgroundColor: Colors.black,
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
                if (cameraRef.current) {
                  const photo = await cameraRef.current.takePictureAsync();
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
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  borderWidth: 2,
                  borderColor: Colors.white,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: Colors.white,
                  }}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
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
  </CameraView>
    </Modal>
  );
};

export default CameraModule;
