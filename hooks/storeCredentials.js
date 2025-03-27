import AsyncStorage from "@react-native-async-storage/async-storage";

const add = async (key, value) => {
    try {
        await AsyncStorage.setItem(key, value);
    } catch (error) {
        console.error('Error storing data:', error);
    }
};

const remove = async (key) => {
    try {
        await AsyncStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing data:', error);
    }
};

export default {
    add,
    remove
};