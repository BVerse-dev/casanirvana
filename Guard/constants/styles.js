import { ms } from "react-native-size-matters/extend";

export const Colors = {
  primary: "#c92c24",
  black: "#333333",
  white: "#FFFFFF",
  transparent: "transparent",
  transparentBlack: "#00000080",
  grey: "#949494",
  lightGrey: "#fafafaff",
  extraLightGrey: "#FDFDFD",
  extraDarkGrey: "#777777",
  regularGrey: "#F6F3F3",
  sky: "#D6E9F5",
  lightSky: "#D2E3EF",
  extraLightSky: "#E8F2F9",
  blue: "#304979",
  lightBlue: "#008DB9",
  darkBlue: "#1E4799",
  extraLightBlue: "#CBDAF0",
  regularBlue: "#7A99AD",
  red: "#E46464",
  lightRed: "#EF1717",
  darkRed: "#FC1515",
  green: "#3EB655",
  lightGreen: "#1E996D",
  orange: "#E49852",
  porcelain: "#e7ebed",
  silver: "#C9C9C9",
};
export const Fonts = {
  SemiBold28primary: {
    fontFamily: "Inter-SemiBold",
    fontSize: 28,
    color: Colors.primary,
  },
  SemiBold14primary: {
    fontFamily: "Inter-SemiBold",
    fontSize: 14,
    color: Colors.primary,
  },
  SemiBold15red: {
    fontFamily: "Inter-SemiBold",
    fontSize: 15,
    color: Colors.red,
  },
  SemiBold15lightBlue: {
    fontFamily: "Inter-SemiBold",
    fontSize: 15,
    color: Colors.lightBlue,
  },
  SemiBold14green: {
    fontFamily: "Inter-SemiBold",
    fontSize: 14,
    color: Colors.green,
  },
  SemiBold18primary: {
    fontFamily: "Inter-SemiBold",
    fontSize: 18,
    color: Colors.primary,
  },
  SemiBold16primary: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    color: Colors.primary,
  },
  SemiBold18blue: {
    fontFamily: "Inter-SemiBold",
    fontSize: 18,
    color: Colors.blue,
  },
  SemiBold14white: {
    fontFamily: "Inter-SemiBold",
    fontSize: 14,
    color: Colors.white,
  },
  SemiBold18black: {
    fontFamily: "Inter-SemiBold",
    fontSize: 18,
    color: Colors.black,
  },
  SemiBold22black: {
    fontFamily: "Inter-SemiBold",
    fontSize: 22,
    color: Colors.black,
  },
  SemiBold15black: {
    fontFamily: "Inter-SemiBold",
    fontSize: 15,
    color: Colors.black,
  },
  SemiBold24black: {
    fontFamily: "Inter-SemiBold",
    fontSize: 24,
    color: Colors.black,
  },
  SemiBold16grey: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    color: Colors.grey,
  },
  SemiBold14grey: {
    fontFamily: "Inter-SemiBold",
    fontSize: 14,
    color: Colors.grey,
  },
  SemiBold12grey: {
    fontFamily: "Inter-SemiBold",
    fontSize: 12,
    color: Colors.grey,
  },
  SemiBold18white: {
    fontFamily: "Inter-SemiBold",
    fontSize: 18,
    color: Colors.white,
  },
  SemiBold16black: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    color: Colors.black,
  },
  SemiBold16white: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    color: Colors.white,
  },
  SemiBold21primary: {
    fontFamily: "Inter-SemiBold",
    fontSize: 21,
    color: Colors.primary,
  },
  Medium14extraDarkGrey: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: Colors.extraDarkGrey,
  },
  Medium16grey: {
    fontFamily: "Inter-Medium",
    fontSize: 16,
    color: Colors.grey,
  },
  Medium14grey: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: Colors.grey,
  },
  Medium12grey: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: Colors.grey,
  },
  Medium16black: {
    fontFamily: "Inter-Medium",
    fontSize: 16,
    color: Colors.black,
  },
  Medium14black: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: Colors.black,
  },
  Medium15grey: {
    fontFamily: "Inter-Medium",
    fontSize: 15,
    color: Colors.grey,
  },
  Medium18grey: {
    fontFamily: "Inter-Medium",
    fontSize: 18,
    color: Colors.grey,
  },
  Medium14white: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: Colors.white,
  },
  Medium20black: {
    fontFamily: "Inter-Medium",
    fontSize: 20,
    color: Colors.black,
  },
  Medium18primary: {
    fontFamily: "Inter-Medium",
    fontSize: 18,
    color: Colors.primary,
  },
  Medium16primary: {
    fontFamily: "Inter-Medium",
    fontSize: 16,
    color: Colors.primary,
  },
  Medium14primary: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: Colors.primary,
  },
  Regular16black: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: Colors.black,
  },
  Regular14primary: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: Colors.primary,
  },
};

export const Default = {
  shadow: {
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5.84,
    elevation: 8,
  },

  fixPadding: ms(10),
};
export default { Colors, Fonts, Default };
