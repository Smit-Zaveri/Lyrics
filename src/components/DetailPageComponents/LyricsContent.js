import React, { forwardRef } from 'react';
import { View, Text, ScrollView, Animated } from 'react-native';

const LyricsContent = forwardRef(({ 
  song, 
  content,
  artist, 
  fontSize, 
  themeColors,
  panHandlers,
  animated = false,
  animatedStyle = {}
}, ref) => {
  
  return (
    <>
      {animated ? (
        <Animated.View style={animatedStyle}>
          {artist && (
            <Text
              style={{
                paddingTop: 10,
                fontSize: 16,
                marginBottom: 10,
                color: themeColors.text,
              }}>
              {'રચનાર :'} {artist}
            </Text>
          )}
          
          <ScrollView
            ref={ref}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30, paddingTop: 10 }}
          >
            <Text 
              style={{ 
                fontSize: fontSize, 
                color: themeColors.text 
              }} 
              {...panHandlers}
            >
              {content}
            </Text>
          </ScrollView>
        </Animated.View>
      ) : (
        <>
          {artist && (
            <Text
              style={{
                paddingTop: 10,
                fontSize: 16,
                marginBottom: 10,
                color: themeColors.text,
              }}>
              {'રચનાર :'} {artist}
            </Text>
          )}
          
          <ScrollView
            ref={ref}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
          >
            <Text 
              style={{ 
                fontSize: fontSize, 
                color: themeColors.text 
              }} 
              {...panHandlers}
            >
              {content}
            </Text>
          </ScrollView>
        </>
      )}
    </>
  );
});

export default LyricsContent;