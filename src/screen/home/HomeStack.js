import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useContext } from 'react';
import { ThemeContext } from '../../../App';
import DetailPage from '../../components/DetailPage';
import List from '../../components/List';
import Search from '../../components/Search';
import AddSong from '../singer/AddSong';
import SingerMode from '../singer/SingerMode';
import HomeList from './HomeList';

// Create stack navigator instance
const Stack = createNativeStackNavigator();

// HomeStack component defines the navigation stack for home-related screens
const HomeStack = () => {
	// Access theme colors from context
	const {themeColors} = useContext(ThemeContext);

	return (
		<Stack.Navigator
			initialRouteName="HomeList"
			screenOptions={{
				// Set header background to primary theme color
				headerStyle: {
					backgroundColor: themeColors.primary,
				},
				// White text color for header
				headerTintColor: '#fff',
				// Bold title with larger font
				headerTitleStyle: {
					fontWeight: 'bold',
					fontSize: 20,
				},
			}}>
			{/* Main home screen displaying the app's primary content */}
			<Stack.Screen name="HomeList" component={HomeList} options={{headerTitle: 'Jain Dhun'}} />
			{/* Screen for displaying lists of items */}
			<Stack.Screen name="List" component={List} />
			{/* Search screen for finding content */}
			<Stack.Screen name="Search" component={Search} />
			{/* Detailed view of selected items */}
			<Stack.Screen name="Details" component={DetailPage} />
			{/* Singer mode for performance features */}
			<Stack.Screen name="SingerMode" component={SingerMode} />
			{/* Screen to add new songs */}
			<Stack.Screen name="AddSong" component={AddSong} />
		</Stack.Navigator>
	);
};

export default HomeStack;
