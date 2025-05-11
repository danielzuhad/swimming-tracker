import AddUserModal from "@/components/AddUserModal";
import { Colors } from "@/constants/Colors";
import { Typography } from "@/constants/Typhography";
import useUsersStore from "@/store/useUsersStore";
import { IUser } from "@/type/user";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
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

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      user.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const openModal = useCallback(() => setModalVisible(true), []);
  const closeModal = useCallback(() => setModalVisible(false), []);

  const handleDelete = useCallback(
    (id: string) => {
      removeUserById(id);
    },
    [removeUserById]
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
          <Card user={item} onDelete={() => handleDelete(item.id)} />
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            Tidak ada murid ditemukan.
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />

      <TouchableOpacity style={styles.fab} onPress={openModal}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <AddUserModal visible={modalVisible} onClose={closeModal} />
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
    fontFamily: Typography.bold,
    fontSize: 32,
    color: Colors.light.text,
  },
  subTitle: {
    fontSize: 14,
    color: Colors.light.text,
    marginTop: 4,
    fontFamily: Typography.regular,
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 8,
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
    fontFamily: Typography.bold,
    color: "#333",
  },
  cardButton: {
    backgroundColor: Colors.light.redScodndary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cardButtonText: {
    color: "white",
    fontFamily: Typography.bold,
    paddingBottom: 3,
  },
  searchInput: {
    backgroundColor: Colors.light.foreground,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    fontFamily: Typography.light,
    fontSize: 16,
    marginBottom: 16,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: Colors.light.primary,
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
