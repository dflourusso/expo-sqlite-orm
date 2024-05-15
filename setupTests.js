jest.mock('expo-modules-core', () => ({ requireNativeModule: jest.fn() }), { virtual: true })
jest.mock('react-native', () => ({}), { virtual: true })