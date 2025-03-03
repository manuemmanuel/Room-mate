import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

type StudentProfile = {
  id: string;
  full_name: string;
  room_number: string;
  attendance_percentage: number;
  total_complaints: number;
};

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [stats, setStats] = useState({
    totalAttendance: 0,
    activeComplaints: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStudentData(),
        fetchStudentStats(),
      ]);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: profile, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setStudentProfile(profile);
    } catch (error: any) {
      console.error('Error fetching student data:', error.message);
    }
  };

  const fetchStudentStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { count: complaintsCount } = await supabase
        .from('complaints')
        .select('*', { count: 'exact' })
        .eq('student_id', user.id)
        .eq('status', 'pending');

      setStats({
        totalAttendance: 85, // Example static value
        activeComplaints: complaintsCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace('/(auth)/student');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Text style={styles.welcomeText}>
            Welcome, {studentProfile?.full_name}
          </Text>
          <TouchableOpacity onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalAttendance}%</Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.activeComplaints}</Text>
            <Text style={styles.statLabel}>Active Complaints</Text>
          </View>
        </View>

        {/* Student Info */}
        <Text style={styles.sectionTitle}>Your Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Room Number:</Text>
            <Text style={styles.infoValue}>{studentProfile?.room_number || 'Not Assigned'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Student ID:</Text>
            <Text style={styles.infoValue}>{studentProfile?.id}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 40,
  },
  welcomeText: {
    fontSize: 24,
    fontFamily: 'Aeonik-Bold',
  },
  signOutText: {
    color: '#B3D8A8',
    fontFamily: 'Aeonik-Medium',
  },
  text: {
    fontFamily: 'Aeonik-Regular',
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    width: '100%',
    gap: 15,
    marginBottom: 25,
  },
  statCard: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 15,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Aeonik-Bold',
    color: '#B3D8A8',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 16,
    fontFamily: 'Aeonik-Regular',
    color: '#666',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Aeonik-Bold',
    marginBottom: 15,
  },
  infoCard: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontSize: 16,
    fontFamily: 'Aeonik-Regular',
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontFamily: 'Aeonik-Medium',
    color: '#333',
  },
});
