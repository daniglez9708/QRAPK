import React, { useState, useEffect } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs, Stack, router } from 'expo-router';
import { Pressable, StatusBar } from 'react-native';
import Colors from '@/constants/Colors';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { supabase } from '../../app/api/supabaseConfig';
import { User as SupabaseUser } from '@supabase/supabase-js';
import UserForm from '@/components/User'; 

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    const { data: { subscription: supabaseSubscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSupabaseUser(session?.user ?? null);
    });

    return () => {
      supabaseSubscription?.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSupabaseUser(null);
    router.push('/screen/login');
  };

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors['light'].tint,
          // Disable the static render of the header on web
          // to prevent a hydration error in React Navigation v6.
          headerShown: useClientOnlyValue(false, true),
          headerStyle: {
            backgroundColor: Colors['light'].tint,
          },
          headerTintColor: Colors['light'].text,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ color }) => (
              <TabBarIcon name={"home"} color={color} />
            ),
            headerRight: () => (
              supabaseUser ? (
                <Pressable onPress={handleSignOut}>
                  {({ pressed }) => (
                    <FontAwesome
                      name="sign-out"
                      size={25}
                      color={Colors['light'].text}
                      style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                    />
                  )}
                </Pressable>
              ) : (
                <Link href="/modal" asChild>
                  <Pressable>
                    {({ pressed }) => (
                      <FontAwesome
                        name="user"
                        size={25}
                        color={Colors['light'].text}
                        style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                      />
                    )}
                  </Pressable>
                </Link>
              )
            ),
          }}
        />
        <Tabs.Screen
          name="two"
          options={{
            title: 'Vender Producto',
            tabBarIcon: ({ color }) => <TabBarIcon name="qrcode" color={color} />,
          }}
        />
        <Tabs.Screen
          name="reporte"
          options={{
            title: 'Reportes',
            tabBarIcon: ({ color }) => <TabBarIcon name="sliders" color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}