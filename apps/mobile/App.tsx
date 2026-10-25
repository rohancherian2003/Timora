import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { calcRectangularCFT, formatINR } from '@timora/shared';

export default function App() {
  const [activeTab, setActiveTab] = useState<'market' | 'calc' | 'carpenters'>('market');
  const [lang, setLang] = useState<'en' | 'ml'>('en');

  // Calculator inputs
  const [lengthFt, setLengthFt] = useState('10');
  const [widthIn, setWidthIn] = useState('6');
  const [thicknessIn, setThicknessIn] = useState('2');
  const [pieces, setPieces] = useState('1');
  const [ratePerCft, setRatePerCft] = useState('2200');

  const calcResult = (() => {
    try {
      const l = parseFloat(lengthFt);
      const w = parseFloat(widthIn);
      const t = parseFloat(thicknessIn);
      const p = parseInt(pieces, 10);
      const r = parseFloat(ratePerCft);
      if (l > 0 && w > 0 && t > 0 && p > 0) {
        return calcRectangularCFT({
          length_ft: l,
          width_in: w,
          thickness_in: t,
          pieces: p,
          price_per_cft: r > 0 ? r : undefined,
        });
      }
      return null;
    } catch {
      return null;
    }
  })();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logoTitle}>TIMORA</Text>
          <Text style={styles.logoSubtitle}>
            {lang === 'en' ? 'Smart Timber Marketplace' : 'കേരള തടി മാർക്കറ്റ്'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.langBtn}
          onPress={() => setLang((prev) => (prev === 'en' ? 'ml' : 'en'))}
        >
          <Text style={styles.langBtnText}>{lang === 'en' ? 'മലയാളം' : 'English'}</Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'market' && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>
              {lang === 'en' ? 'Approved Raw Timber' : 'ലഭ്യമായ തടികൾ'}
            </Text>
            <Text style={styles.sectionSub}>
              {lang === 'en' ? 'Zero furniture · 100% Raw Timber' : 'യഥാർത്ഥ തടികൾ മാത്രം'}
            </Text>

            {/* Timber Listing Card */}
            <View style={styles.card}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Teak (തേക്ക്)</Text>
              </View>
              <Text style={styles.cardTitle}>Nilambur Teak Planks 10ft</Text>
              <Text style={styles.cardDetail}>Rough-sawn Planks · Kottayam</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.price}>₹2,800 / CFT</Text>
                <TouchableOpacity style={styles.actionBtn}>
                  <Text style={styles.actionBtnText}>
                    {lang === 'en' ? 'Enquire' : 'അന്വേഷിക്കുക'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Anjili (ആഞ്ഞിലി)</Text>
              </View>
              <Text style={styles.cardTitle}>Anjili Wild Jack Heavy Beams</Text>
              <Text style={styles.cardDetail}>Squared Beams · Ernakulam</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.price}>₹1,400 / CFT</Text>
                <TouchableOpacity style={styles.actionBtn}>
                  <Text style={styles.actionBtnText}>
                    {lang === 'en' ? 'Enquire' : 'അന്വേഷിക്കുക'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'calc' && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>
              {lang === 'en' ? 'Kerala CFT Calculator' : 'തടി അളവ് കാൽക്കുലേറ്റർ'}
            </Text>
            <Text style={styles.sectionSub}>CFT = (L_ft × W_in × T_in ÷ 144) × pieces</Text>

            <View style={styles.calcBox}>
              <Text style={styles.inputLabel}>
                {lang === 'en' ? 'Length (Feet / അടി)' : 'നീളം (അടി)'}
              </Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={lengthFt}
                onChangeText={setLengthFt}
              />

              <Text style={styles.inputLabel}>
                {lang === 'en' ? 'Width (Inches / ഇഞ്ച്)' : 'വീതി (ഇഞ്ച്)'}
              </Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={widthIn}
                onChangeText={setWidthIn}
              />

              <Text style={styles.inputLabel}>
                {lang === 'en' ? 'Thickness (Inches / ഇഞ്ച്)' : 'കനം (ഇഞ്ച്)'}
              </Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={thicknessIn}
                onChangeText={setThicknessIn}
              />

              <Text style={styles.inputLabel}>
                {lang === 'en' ? 'Pieces (എണ്ണം)' : 'എണ്ണം'}
              </Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={pieces}
                onChangeText={setPieces}
              />

              <Text style={styles.inputLabel}>
                {lang === 'en' ? 'Rate / CFT (₹)' : 'ഒരു CFT യുടെ വില (₹)'}
              </Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={ratePerCft}
                onChangeText={setRatePerCft}
              />

              {calcResult && (
                <View style={styles.calcResultBox}>
                  <Text style={styles.calcResultLabel}>
                    {lang === 'en' ? 'Total Volume' : 'ആകെ വ്യാപ്തി'}
                  </Text>
                  <Text style={styles.calcResultValue}>{calcResult.total_cft} CFT</Text>
                  {calcResult.estimated_cost && (
                    <Text style={styles.calcPriceValue}>
                      {formatINR(calcResult.estimated_cost)}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>
        )}

        {activeTab === 'carpenters' && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>
              {lang === 'en' ? 'Kerala Carpenters' : 'തച്ചന്മാർ (Carpenters)'}
            </Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>K. R. Mohanan Achari</Text>
              <Text style={styles.cardDetail}>28 yrs exp · Changanassery, Kottayam</Text>
              <Text style={styles.cardSpec}>Doors · Roofing · Windows</Text>
              <TouchableOpacity style={[styles.actionBtn, { marginTop: 10 }]}>
                <Text style={styles.actionBtnText}>
                  {lang === 'en' ? 'Call Carpenter' : 'വിളിക്കുക'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('market')}
        >
          <Text style={[styles.tabLabel, activeTab === 'market' && styles.tabActive]}>
            🪵 {lang === 'en' ? 'Market' : 'മാർക്കറ്റ്'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('calc')}
        >
          <Text style={[styles.tabLabel, activeTab === 'calc' && styles.tabActive]}>
            🧮 {lang === 'en' ? 'Calculator' : 'കാൽക്കുലേറ്റർ'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('carpenters')}
        >
          <Text style={[styles.tabLabel, activeTab === 'carpenters' && styles.tabActive]}>
            🔨 {lang === 'en' ? 'Carpenters' : 'ആശാരിമാർ'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: 0.5,
  },
  logoSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#15803d',
    textTransform: 'uppercase',
  },
  langBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  langBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  sectionSub: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#166534',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  cardDetail: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  cardSpec: {
    fontSize: 11,
    color: '#15803d',
    fontWeight: '600',
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#14532d',
  },
  actionBtn: {
    backgroundColor: '#15803d',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  calcBox: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    color: '#0f172a',
  },
  calcResultBox: {
    marginTop: 14,
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  calcResultLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#166534',
  },
  calcResultValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#14532d',
    marginVertical: 2,
  },
  calcPriceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingVertical: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  tabActive: {
    color: '#15803d',
    fontWeight: 'bold',
  },
});
