import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Menu, MenuItem, MenuDivider } from 'react-native-material-menu';
import { Ionicons } from '@expo/vector-icons';

type MenuItemType = {
  text: string;
  onPress: () => void;
  isDestructive?: boolean;
};

type HeaderMenuProps = {
  menuItems: MenuItemType[];
};

export const HeaderMenu: React.FC<HeaderMenuProps> = ({ menuItems }) => {
  const [visible, setVisible] = useState(false);

  const hideMenu = () => setVisible(false);
  const showMenu = () => setVisible(true);

  return (
    <View style={styles.container}>
      <Menu
        visible={visible}
        anchor={
          <TouchableOpacity onPress={showMenu}>
            <Ionicons name="ellipsis-vertical" size={24} color="black" />
          </TouchableOpacity>
        }
        onRequestClose={hideMenu}
      >
        {menuItems.map((item, index) => (
          <MenuItem
            key={index}
            onPress={() => {
              hideMenu();
              item.onPress();
            }}
            textStyle={item.isDestructive ? styles.destructiveText : {}}
          >
            {item.text}
          </MenuItem>
        ))}
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 10,
  },
  destructiveText: {
    color: 'red',
  },
});