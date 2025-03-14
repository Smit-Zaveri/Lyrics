import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AudioPlayer from '../../src/components/DetailPageComponents/AudioPlayer';
import Sound from 'react-native-sound';

// Mock react-native-sound
jest.mock('react-native-sound', () => {
  return jest.fn().mockImplementation(() => ({
    play: jest.fn(callback => callback(true)),
    stop: jest.fn(),
    pause: jest.fn(),
    release: jest.fn(),
  }));
});

const mockSong = {
  id: '1',
  title: 'Test Song',
  audio: 'test-audio.mp3'
};

const mockThemeColors = {
  primary: '#000',
  text: '#000',
  border: '#ccc'
};

describe('AudioPlayer Component', () => {
  const mockOnTogglePlayback = jest.fn();
  const mockOnSeekValueChange = jest.fn();
  const mockOnSeekComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders properly when audio is available', () => {
    const { getByTestId } = render(
      <AudioPlayer
        song={mockSong}
        sound={new Sound()}
        isPlaying={false}
        isLoading={false}
        audioError={null}
        progress={0}
        duration={100}
        seekValue={0}
        themeColors={mockThemeColors}
        onTogglePlayback={mockOnTogglePlayback}
        onSeekValueChange={mockOnSeekValueChange}
        onSeekComplete={mockOnSeekComplete}
      />
    );

    expect(getByTestId('play-button')).toBeTruthy();
  });

  it('shows loading state', () => {
    const { getByTestId } = render(
      <AudioPlayer
        song={mockSong}
        sound={null}
        isPlaying={false}
        isLoading={true}
        audioError={null}
        progress={0}
        duration={0}
        seekValue={0}
        themeColors={mockThemeColors}
        onTogglePlayback={mockOnTogglePlayback}
        onSeekValueChange={mockOnSeekValueChange}
        onSeekComplete={mockOnSeekComplete}
      />
    );

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('displays error message when audio fails', () => {
    const { getByText } = render(
      <AudioPlayer
        song={mockSong}
        sound={null}
        isPlaying={false}
        isLoading={false}
        audioError="Failed to load audio"
        progress={0}
        duration={0}
        seekValue={0}
        themeColors={mockThemeColors}
        onTogglePlayback={mockOnTogglePlayback}
        onSeekValueChange={mockOnSeekValueChange}
        onSeekComplete={mockOnSeekComplete}
      />
    );

    expect(getByText('Failed to load audio')).toBeTruthy();
  });

  it('toggles play/pause when button is pressed', () => {
    const { getByTestId } = render(
      <AudioPlayer
        song={mockSong}
        sound={new Sound()}
        isPlaying={false}
        isLoading={false}
        audioError={null}
        progress={0}
        duration={100}
        seekValue={0}
        themeColors={mockThemeColors}
        onTogglePlayback={mockOnTogglePlayback}
        onSeekValueChange={mockOnSeekValueChange}
        onSeekComplete={mockOnSeekComplete}
      />
    );

    fireEvent.press(getByTestId('play-button'));
    expect(mockOnTogglePlayback).toHaveBeenCalled();
  });
});