import FontFamily from "../constants/FontFamily";
import { CommonColors } from "./Colors";
import { StyleSheet } from "react-native";
import { scale } from "./scaling";

const CommonStyles = StyleSheet.create({
    //example first page
    Title: {
        fontFamily: FontFamily.PublicSans_Medium,
        fontSize: scale(40),
        textAlign: "center",
        color: CommonColors.textWhite,
    },
    SubTitle: {
        fontFamily: FontFamily.PublicSans_Regular,
        fontSize: scale(36),
        textAlign: "center",
        color: CommonColors.textSecondary,
    },

    //example second page Left side text
    Heading: {
        fontFamily: FontFamily.PublicSans_Bold,
        fontSize: scale(42),
        textAlign: "center",
        color: CommonColors.textWhite,
    },
    SubHeading: {
        fontFamily: FontFamily.PublicSans_SemiBold,
        fontSize: scale(28),
        textAlign: "center",
        color: CommonColors.textWhite,
    },


})

export default CommonStyles;