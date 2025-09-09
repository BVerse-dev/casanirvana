import React from "react";
import { Colors } from "../constants/styles";
import { Dimensions } from "react-native";
import { Calendar } from "react-native-calendars";
import { MaterialIcons } from "@expo/vector-icons";
import moment from "moment";

const { width } = Dimensions.get("window");

const FromToCalendarPicker = (props) => {
  return (
    <Calendar
      style={{ width: width * 0.85 }}
      minDate={props.minDate || moment().format('YYYY-MM-DD')}
      maxDate={props.maxDate}
      current={props.current || moment().format('YYYY-MM-DD')}
      firstDay={1}
      hideExtraDays={true}
      renderArrow={(direction) =>
        direction == "left" ? (
          <MaterialIcons name="arrow-back-ios" color={Colors.grey} size={18} />
        ) : (
          <MaterialIcons
            name="arrow-forward-ios"
            color={Colors.grey}
            size={18}
          />
        )
      }
      theme={{
        backgroundColor: Colors.white,
        calendarBackground: Colors.white,
        textSectionTitleColor: Colors.black,
        selectedDayTextColor: Colors.white,
        todayTextColor: Colors.primary,
        dayTextColor: Colors.black,
        textDisabledColor: Colors.grey,
        textMonthFontFamily: "Inter-SemiBold",
        textDayHeaderFontFamily: "Inter-SemiBold",
        textDayFontFamily: "Inter-SemiBold",
        monthTextColor: Colors.primary,
        arrowColor: Colors.primary,
      }}
      onDayPress={props.onDayPress}
      markedDates={props.current ? {
        [props.current]: {
          selected: true,
          selectedColor: Colors.primary,
        },
      } : {}}
    />
  );
};

export default FromToCalendarPicker;
