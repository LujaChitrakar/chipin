import { View } from 'react-native';
import React, { ReactNode } from 'react';
import colors from "@/assets/colors";

type ScreenContainerProps = {
    children: ReactNode;
};

const ScreenContainer = ({ children }: ScreenContainerProps) => {
    return (
        <View
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                height: '100%',
                backgroundColor: colors.background.dark,
                paddingHorizontal: 20,
            }}
        >
            {children}
        </View>
    );
};

export default ScreenContainer;
