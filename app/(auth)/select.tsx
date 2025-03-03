import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function SelectRole() {
  const router = useRouter();

  const handleRoleSelect = (role: 'admin' | 'student') => {
    router.push(`/${role}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Role</Text>

      <View style={styles.inputContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => handleRoleSelect('admin')}
        >
          <Text style={styles.buttonText}>Admin</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => handleRoleSelect('student')}
        >
          <Text style={styles.buttonText}>Student</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Aeonik-Bold',
    marginBottom: 30,
  },
  inputContainer: {
    width: '100%',
    gap: 15,
    marginBottom: 25,
  },
  button: {
    backgroundColor: '#B3D8A8',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Aeonik-Medium',
  },
});
