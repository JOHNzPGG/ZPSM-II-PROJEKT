import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#A61D1D',
  primaryDark: '#7E1717',
  background: '#8D8FB3',
  surface: '#F4F4F7',
  cardBg: '#FFFFFF',
  navBg: '#A61D1D',
  textWhite: '#FFFFFF',
  textLight: '#E8E8E8',
  textDark: '#1F2330',
  textMuted: '#7A7F93',
  border: '#D9DCE5',
  shadow: '#000000',
  black: '#111111',
  white: '#FFFFFF',
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 24,
  },

  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  setupCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },

  setupAppTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 12,
  },

  setupSubtitle: {
    fontSize: 15,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 22,
    lineHeight: 22,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 20,
    textAlign: 'center',
  },

  whiteText: {
    color: colors.white,
  },

  input: {
    backgroundColor: colors.white,
    width: '100%',
    padding: 15,
    borderRadius: 10,
    fontSize: 18,
    marginBottom: 20,
    color: colors.textDark,
  },

  inputModern: {
    backgroundColor: colors.surface,
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 16,
    fontSize: 16,
    marginBottom: 18,
    color: colors.textDark,
    borderWidth: 1,
    borderColor: colors.border,
  },

  buttonPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 5,
  },

  buttonText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.5,
  },

  homeScrollContent: {
    paddingTop: 60,
    paddingHorizontal: 18,
    paddingBottom: 130,
  },

  greetingCard: {
    backgroundColor: colors.surface,
    alignSelf: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    marginBottom: 28,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },

  greetingText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textDark,
  },

  greetingSubtext: {
    marginTop: 6,
    fontSize: 14,
    color: colors.textMuted,
  },

  section: {
    marginTop: 8,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 16,
    paddingHorizontal: 4,
  },

  cardGrid: {
    gap: 14,
  },

  dashboardCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    padding: 18,
    minHeight: 105,
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  dashboardCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textDark,
    marginBottom: 8,
  },

  dashboardCardText: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 21,
  },

  bottomNavWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },

  bottomNav: {
    height: 92,
    backgroundColor: colors.navBg,
    borderTopWidth: 2,
    borderTopColor: colors.black,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },

  navItem: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },

  navItemActive: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.black,
    borderWidth: 3,
    borderColor: colors.surface,
    marginTop: -22,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },

  navLabel: {
    display: 'none',
  },

  nav3dText: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textDark,
  },

  // stare style zostawione na później, jeśli coś już z nich korzysta
  card: {
    backgroundColor: colors.white,
    flexDirection: 'row',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },

  configCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    elevation: 4,
  },

  configHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#bbb',
    paddingBottom: 10,
    marginBottom: 10,
  },

  configTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
  },

  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },

  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },

  emptyState: {
    alignItems: 'center',
    padding: 40,
  },

  mainAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },

  headerMain: {
    backgroundColor: colors.cardBg,
    marginHorizontal: 30,
    marginTop: 60,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    elevation: 3,
  },

  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
  },
});