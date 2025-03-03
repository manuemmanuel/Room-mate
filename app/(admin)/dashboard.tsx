import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

type Student = {
  id: string;
  full_name: string;
  room_number?: string;
  attendance_percentage?: number;
  pending_complaints: number;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalComplaints: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchAdminData(),
        fetchDashboardStats(),
        fetchStudents()
      ]);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: profile, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setAdminProfile(profile);
    } catch (error: any) {
      console.error('Error fetching admin data:', error.message);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('student_profiles')
        .select(`
          id,
          full_name,
          room_number,
          attendance_percentage,
          complaints (count)
        `)
        .eq('complaints.status', 'pending');

      if (error) throw error;
      
      const formattedStudents: Student[] = (data || []).map(student => ({
        id: student.id,
        full_name: student.full_name,
        room_number: student.room_number,
        attendance_percentage: student.attendance_percentage,
        pending_complaints: student.complaints?.[0]?.count || 0
      }));

      setStudents(formattedStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const { count: studentsCount } = await supabase
        .from('student_profiles')
        .select('*', { count: 'exact' });

      const { count: complaintsCount } = await supabase
        .from('complaints')
        .select('*', { count: 'exact' })
        .eq('status', 'pending');

      setStats({
        totalStudents: studentsCount || 0,
        totalComplaints: complaintsCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace('/(auth)/admin');
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
            Welcome, {adminProfile?.hostel_name}
          </Text>
          <TouchableOpacity onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalStudents}</Text>
            <Text style={styles.statLabel}>Total Students</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalComplaints}</Text>
            <Text style={styles.statLabel}>Active Complaints</Text>
          </View>
        </View>

        {/* Students List */}
        <Text style={styles.sectionTitle}>Student Overview</Text>
        {students.map((student) => (
          <View key={student.id} style={styles.studentCard}>
            <View style={styles.studentHeader}>
              <Text style={styles.studentName}>{student.full_name}</Text>
              <Text style={styles.roomNumber}>Room {student.room_number || 'Not Assigned'}</Text>
            </View>
            
            <View style={styles.studentStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{student.attendance_percentage || 0}%</Text>
                <Text style={styles.statLabel}>Attendance</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{student.pending_complaints}</Text>
                <Text style={styles.statLabel}>Complaints</Text>
              </View>
            </View>
          </View>
        ))}
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
    marginTop: 40, // Added top margin
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
  studentCard: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  studentName: {
    fontSize: 16,
    fontFamily: 'Aeonik-Medium',
    color: '#333',
  },
  roomNumber: {
    fontSize: 14,
    fontFamily: 'Aeonik-Regular',
    color: '#666',
  },
  studentStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Aeonik-Bold',
    color: '#B3D8A8',
  },
});
