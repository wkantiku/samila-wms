import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import ReceivingScreen  from '../screens/ReceivingScreen';
import PutawayScreen    from '../screens/PutawayScreen';
import PickingScreen    from '../screens/PickingScreen';
import ShippingScreen   from '../screens/ShippingScreen';
import StockCountScreen from '../screens/StockCountScreen';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Receiving',   key: 'nav.receiving',   icon: '📥', Screen: ReceivingScreen  },
  { name: 'Putaway',     key: 'nav.putaway',     icon: '🏷️', Screen: PutawayScreen    },
  { name: 'Picking',     key: 'nav.picking',     icon: '🔍', Screen: PickingScreen    },
  { name: 'Shipping',    key: 'nav.shipping',    icon: '📤', Screen: ShippingScreen   },
  { name: 'StockCount',  key: 'nav.stockCount',  icon: '📊', Screen: StockCountScreen },
];

export default function MobileNavigator() {
  const { t } = useTranslation();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#0d1f35',
            borderTopColor: 'rgba(0,229,255,0.15)',
            borderTopWidth: 1,
            height: 64,
            paddingBottom: 8,
            paddingTop: 4,
          },
          tabBarActiveTintColor: '#00E5FF',
          tabBarInactiveTintColor: '#4a7a99',
          tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
        }}
      >
        {TABS.map(({ name, key, icon, Screen }) => (
          <Tab.Screen
            key={name}
            name={name}
            component={Screen}
            options={{
              tabBarLabel: t(key),
              tabBarIcon: ({ color }) => (
                <Text style={{ fontSize: 22, color }}>{icon}</Text>
              ),
            }}
          />
        ))}
      </Tab.Navigator>
    </NavigationContainer>
  );
}
