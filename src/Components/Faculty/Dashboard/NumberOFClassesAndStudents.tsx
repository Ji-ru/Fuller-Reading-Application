import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image } from 'react-native';
import facultyDashboard from '../../../UI_Designs/FacultyDashboardStyles';

interface NumberOfClassesAndStudentsProp {
    loading: boolean;
    classCount: number;
    studentCount: number
    loadingMessage?: string;
    noDataMessage?: string;
    noDataSubMessage?: string;
}

const NumberOfClassesAndStudents: React.FC<NumberOfClassesAndStudentsProp> = ({
    loading,
    classCount,
    studentCount,
    loadingMessage = 'Loading dashboard data...',
    noDataMessage = 'No Classes Yet',
    noDataSubMessage = 'Create your first class to get started'
}) => {
    if (loading) {
        return (
            <View style={facultyDashboard.loadingContainer}>
                <ActivityIndicator size="large" color="#4ECDC4" />
                <Text style={facultyDashboard.loadingText}>Loading dashboard data...</Text>
            </View>
        );
    }

    if (classCount === 0) {
        return (
            <View style={facultyDashboard.noDataContainer}>
                <Text style={facultyDashboard.noDataText}>No Classes Yet</Text>
                <Text style={facultyDashboard.noDataSubtext}>
                    Create your first class to get started
                </Text>
            </View>
        );
    }

    return (
        <View style={facultyDashboard.statsContainer}>
            <View style={facultyDashboard.statCard}>
                <View style={facultyDashboard.iconContainer}>
                    <Image
                        style={facultyDashboard.icons}
                        source={require('../../../../assets/icons/Class-icon.png')}
                    />
                    <Text style={facultyDashboard.statValue}>{classCount}</Text>
                </View>
                <Text style={facultyDashboard.statLabel}>
                    Total Class{classCount !== 1 ? 'es' : ''}
                </Text>
            </View>
            <View style={facultyDashboard.statCard}>
                <View style={facultyDashboard.iconContainer}>
                    <Image
                        style={facultyDashboard.icons}
                        source={require('../../../../assets/icons/Student-icon.png')}
                    />
                    <Text style={facultyDashboard.statValue}>{studentCount}</Text>
                </View>
                <Text style={facultyDashboard.statLabel}>
                    Total Student{studentCount !== 1 ? 's' : ''}
                </Text>
            </View>
        </View>
    );
}

export default NumberOfClassesAndStudents;