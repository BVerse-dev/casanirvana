import Constants from "expo-constants";
import { isRunningInExpoGo } from "expo";

const executionEnvironment = Constants.executionEnvironment;
const appOwnership = Constants.appOwnership;

export const isExpoGo =
  isRunningInExpoGo ||
  executionEnvironment === "storeClient" || appOwnership === "expo";

export const isPushNotificationsSupported = !isExpoGo;
