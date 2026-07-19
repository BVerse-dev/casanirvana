import React from "react";
import { Text } from "react-native";
import { Snackbar } from "react-native-paper";
import { Colors, Fonts } from "../constants/styles";

const SnackbarToast = (props) => {
  return (
    <Snackbar
      visible={props.visible}
      onDismiss={props.onDismiss}
      duration={1000}
      style={{
        backgroundColor: Colors.black,
      }}
    >
      <Text style={{ ...Fonts.SemiBold14white, textAlign: "center" }}>
        {props.title}
      </Text>
    </Snackbar>
  );
};

export default SnackbarToast;
