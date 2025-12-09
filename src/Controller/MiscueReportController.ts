import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Miscue } from "../Types/miscue";
import { MiscueReport } from "../Types/dataInterfaces";
import { MiscueAnalysisService } from "./MiscueAnalysisServiceController";

// CHECK IF THIS MIGHT CAUSE SLOW PROCESS STORING INTO THE FIRESTORE
export const MiscueReportController = {
    async storeReport(passageTitle: string, miscues: Miscue[]) {
        try {
            const user = auth.;
            if (!user) throw new Error("No Authenticated User Found!");

            // Summarizes Miscues into report format
            const summary: MiscueReport = this.generateRerportSummary(user.uid, miscues);
        } catch (error: any) {
            throw new Error("Failed to store miscue report: " + error.message);
        }
    },

    generateRerportSummary(studentId: string, miscues: Miscue[]): MiscueReport {
        const substitution = miscues
            .filter(m => m.type === "substitution")
            .map(m => `"${m.expected}"→"${m.spoken}"`)
            .join(", ") || "None";

        const omission = miscues
            .filter(m => m.type === "omission")
            .map(m => `"${m.expected}"`)
            .join(", ") || "None";

        const insertion = miscues
            .filter(m => m.type === "insertion")
            .map(m => `"${m.spoken}"`)
            .join(", ") || "None";

        const repetition = miscues
            .filter(m => m.type === "repetition")
            .map(m => `"${m.spoken}"`)
            .join(", ") || "None";

        return {
            studentId,
            timestamp: new Date(),
            substitution,
            omission,
            insertion,
            repetition,
        };
    }
}