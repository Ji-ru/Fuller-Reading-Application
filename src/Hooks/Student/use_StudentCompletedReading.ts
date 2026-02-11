import { useEffect, useState } from 'react';
import { AlphabetReportDocument, WordReportDocument } from '../../Interfaces/dataInterfaces';
import { MiscueReportController } from '../../Controller/MiscueReportController';

export const useStudentCompletedAlphabet = (studentId: string) => {
    const [completedAlphabets, setCompletedAlphabets] = useState<AlphabetReportDocument[]>([]);
    useEffect(() => {
        if (!studentId) return;

        const unsubscribe = MiscueReportController.getStudentCompletedAlphabet(
            studentId,
            setCompletedAlphabets,
        );

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [studentId]);

    return completedAlphabets;
}

export const useStudentCompletedWord = (studentId: string) => {
    const [completedWords, setCompletedWords] = useState<WordReportDocument[]>([]);
    useEffect(() => {
        if (!studentId) return;

        const unsubscribe = MiscueReportController.getStudentCompletedWord(
            studentId,
            setCompletedWords,
        );

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [studentId]);

    return completedWords;
}