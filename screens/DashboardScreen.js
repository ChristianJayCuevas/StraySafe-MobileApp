import React from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { LineChart } from 'react-native-chart-kit';
import { theme } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';


const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const straySightings = 120;
  const animalBreakdown = { dogs: 80, cats: 40, others: 10 };

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    useShadowColorFromDataset: false,
  };

  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [10, 15, 12, 25, 30, 20],
        strokeWidth: 2,
      },
    ],
  };

  const pieChartData = [
    {
      name: 'Stray Dogs',
      population: animalBreakdown.dogs,
      color: 'rgba(0, 123, 255, 1)',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: 'Stray Cats',
      population: animalBreakdown.cats,
      color: 'rgba(40, 167, 69, 1)',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
  ];

  const recentSightings = [
    {
      id: '1',
      image: require('../assets/Snapshot1.jpg'),
      classification: 'Stray Dog',
      location: 'Central Street',
    },
    {
      id: '2',
      image: require('../assets/Snapshot5.png'),
      classification: 'Stray Dog',
      location: 'Limbaga Street',
    },
    {
      id: '3',
      image: require('../assets/Snapshot4.png'),
      classification: 'Stray Cat',
      location: 'Scout Street',
    },
  ];

  const renderHeader = () => (
        <View style={styles.container}>
          <LinearGradient
      colors={[theme.colors.background, theme.colors.lightBlueAccent]}
      style={styles.gradientBackground}
      ></LinearGradient>
      <View style={styles.dashboardCard}>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Total Stray Sightings</Text>
          <Text style={styles.statValue}>{straySightings}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Animal Type Breakdown</Text>
          <Text style={styles.statValue}>
            Dogs: {animalBreakdown.dogs}{'\n'}
            Cats: {animalBreakdown.cats}{'\n'}
          </Text>
        </View>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <LineChart
          data={lineChartData}
          width={screenWidth - 60}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          bezier
        />
        <PieChart
          data={pieChartData}
          width={screenWidth - 60}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          style={styles.chart}
        />
      </View>
      <Text style={styles.sectionTitle}>Recent Sightings Feed</Text>
    </View>
  );

  const renderSightingCard = ({ item }) => (
    <View style={styles.sightingCard}>
      <Image source={ item.image } style={styles.sightingImage} />
      <View style={styles.sightingDetails}>
        <Text style={styles.sightingTitle}>{item.classification}</Text>
        <Text style={styles.sightingText}>Location: {item.location}</Text>
      </View>
    </View>
  );

  return (
    <FlatList
      data={recentSightings}
      keyExtractor={(item) => item.id}
      renderItem={renderSightingCard}
      ListHeaderComponent={renderHeader}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,  
  },
  headerContainer: {
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  dashboardCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 10,
  },
  chart: {
    marginVertical: 10,
    borderRadius: 10,
  },
  sightingCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    padding: 10,
    alignItems: 'center',
  },
  sightingImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  sightingDetails: {
    flex: 1,
  },
  sightingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 5,
  },
  sightingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});
