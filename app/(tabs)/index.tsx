import AddUserModal from "@/components/AddUserModal";
import { Colors } from "@/constants/Colors";
import useUsersStore from "@/store/useUsersStore";
import { IUser } from "@/type/user";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  GestureResponderEvent,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import "react-native-get-random-values";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const users = useUsersStore((state) => state.users);
  const removeUserById = useUsersStore((state) => state.removeUserById);

  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Selamat datang!</Text>
        <Text style={styles.subTitle}>
          Berikut adalah daftar murid yang mengikuti sesi latihan.
        </Text>
      </View>

      {users?.length > 0 && (
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama murid..."
          value={search}
          onChangeText={setSearch}
        />
      )}

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card user={item} onDelete={() => removeUserById(item.id)} />
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            Tidak ada murid ditemukan.
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <AddUserModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const Card = ({ user, onDelete }: { user: IUser; onDelete: () => void }) => {
  const router = useRouter();

  const handlePress = (userId: string) => {
    router.replace(`/user-detail?userId=${userId}`);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handlePress(user.id)}
      activeOpacity={0.85}
    >
      <View style={styles.row}>
        <Text style={styles.cardName}>{user.name}</Text>
        <TouchableOpacity
          onPress={(e: GestureResponderEvent) => {
            e.stopPropagation();
            onDelete();
          }}
          style={styles.cardButton}
        >
          <Text style={styles.cardButtonText}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  subTitle: {
    fontSize: 16,
    color: Colors.light.textSecondary || "#6e6e6e",
    marginTop: 4,
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EBEBEB",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  cardButton: {
    backgroundColor: "#e74c3c",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cardButtonText: {
    color: "white",
    fontWeight: "600",
  },
  searchInput: {
    backgroundColor: "#f1f1f1",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: Colors.light.tint,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  fabText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
});
