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
  Alert,
} from 'react-native';
import {
  calcRectangularCFT,
  calcKeralaHoppusGirthCFT,
  formatINR,
} from '@timora/shared';

type Tab = 'market' | 'calc' | 'carpenters' | 'transport';
type CalcMode = 'round' | 'rectangular';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('market');
  const [lang, setLang] = useState<'en' | 'ml'>('en');
  const [calcMode, setCalcMode] = useState<CalcMode>('round');

  // Rectangular Sawn Timber Inputs
  const [rectLengthFt, setRectLengthFt] = useState('10');
  const [rectWidthIn, setRectWidthIn] = useState('6');
  const [rectThicknessIn, setRectThicknessIn] = useState('2');
  const [rectPieces, setRectPieces] = useState('1');
  const [rectRatePerCft, setRectRatePerCft] = useState('2200');

  // Round Log (Quarter-Girth Hoppus) Inputs
  const [roundLengthFt, setRoundLengthFt] = useState('12');
  const [roundGirthIn, setRoundGirthIn] = useState('48');
  const [roundPieces, setRoundPieces] = useState('1');
  const [roundRatePerCft, setRoundRatePerCft] = useState('3400');

  // Calculation Results
  const rectResult = (() => {
    try {
      const l = parseFloat(rectLengthFt);
      const w = parseFloat(rectWidthIn);
      const t = parseFloat(rectThicknessIn);
      const p = parseInt(rectPieces, 10);
      const r = parseFloat(rectRatePerCft);
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

  const roundResult = (() => {
    try {
      const l = parseFloat(roundLengthFt);
      const g = parseFloat(roundGirthIn);
      const p = parseInt(roundPieces, 10);
      const r = parseFloat(roundRatePerCft);
      if (l > 0 && g > 0 && p > 0) {
        return calcKeralaHoppusGirthCFT({
          length_ft: l,
          girth_in: g,
          pieces: p,
          price_per_cft: r > 0 ? r : undefined,
        });
      }
      return null;
    } catch {
      return null;
    }
  })();

  const handleEnquire = (species: string, rate: number) => {
    Alert.alert(
      lang === 'en' ? `Enquire about ${species}` : `${species} അന്വേഷണം`,
      lang === 'en'
        ? `Rate: ₹${rate}/CFT. Verified zero-furniture timber with Form IV transit pass assistance.`
        : `വില: ₹${rate}/CFT. ഫോറം IV ട്രാൻസിറ്റ് പാസ്സ് ഉള്ള അംഗീകൃത തടി.`,
      [{ text: lang === 'en' ? 'OK' : 'ശരി' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logoTitle}>TIMORA</Text>
          <Text style={styles.logoSubtitle}>
            {lang === 'en'
              ? 'Kerala Smart Timber Marketplace'
              : 'കേരള സ്മാർട്ട് തടി വിപണി'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.langBtn}
          onPress={() => setLang((prev) => (prev === 'en' ? 'ml' : 'en'))}
        >
          <Text style={styles.langBtnText}>
            {lang === 'en' ? 'മലയാളം' : 'English'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* TAB 1: MARKET */}
        {activeTab === 'market' && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>
              {lang === 'en' ? 'Approved Raw Timber' : 'ലഭ്യമായ തടികൾ'}
            </Text>
            <Text style={styles.sectionSub}>
              {lang === 'en'
                ? 'Zero Furniture · 100% Verified Raw Timber'
                : 'യഥാർത്ഥ തടികൾ മാത്രം · ഫർണിച്ചർ ഇല്ല'}
            </Text>

            {/* Listing 1: Round Log */}
            <View style={styles.card}>
              <View style={styles.badgeRow}>
                <View style={styles.badgeTeak}>
                  <Text style={styles.badgeText}>Teak (തേക്ക്)</Text>
                </View>
                <View style={styles.badgePass}>
                  <Text style={styles.badgePassText}>Form IV Pass</Text>
                </View>
              </View>
              <Text style={styles.cardTitle}>Nilambur First-Grade Round Logs</Text>
              <Text style={styles.cardDetail}>
                Round Logs · Girth 48-60 in · Kottayam
              </Text>
              <View style={styles.cardFooter}>
                <Text style={styles.price}>₹3,400 / CFT</Text>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleEnquire('Nilambur Teak', 3400)}
                >
                  <Text style={styles.actionBtnText}>
                    {lang === 'en' ? 'Enquire' : 'അന്വേഷിക്കുക'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Listing 2: Sawn Beams */}
            <View style={styles.card}>
              <View style={styles.badgeRow}>
                <View style={styles.badgeAnjili}>
                  <Text style={styles.badgeText}>Anjili (ആഞ്ഞിലി)</Text>
                </View>
                <View style={styles.badgePass}>
                  <Text style={styles.badgePassText}>Form III Pass</Text>
                </View>
              </View>
              <Text style={styles.cardTitle}>Anjili Wild Jack Heavy Sawn Beams</Text>
              <Text style={styles.cardDetail}>
                Squared Beams · 12ft × 6in × 4in · Ernakulam
              </Text>
              <View style={styles.cardFooter}>
                <Text style={styles.price}>₹1,450 / CFT</Text>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleEnquire('Anjili Beams', 1450)}
                >
                  <Text style={styles.actionBtnText}>
                    {lang === 'en' ? 'Enquire' : 'അന്വേഷിക്കുക'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Listing 3: Rosewood Planks */}
            <View style={styles.card}>
              <View style={styles.badgeRow}>
                <View style={styles.badgeRosewood}>
                  <Text style={styles.badgeText}>Rosewood (ഈട്ടി)</Text>
                </View>
                <View style={styles.badgePass}>
                  <Text style={styles.badgePassText}>Verified Yard</Text>
                </View>
              </View>
              <Text style={styles.cardTitle}>Seasoned Malabar Rosewood Planks</Text>
              <Text style={styles.cardDetail}>
                Rough Sawn · 8ft × 10in × 1.5in · Kozhikode
              </Text>
              <View style={styles.cardFooter}>
                <Text style={styles.price}>₹4,800 / CFT</Text>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleEnquire('Rosewood Planks', 4800)}
                >
                  <Text style={styles.actionBtnText}>
                    {lang === 'en' ? 'Enquire' : 'അന്വേഷിക്കുക'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* TAB 2: KERALA TIMBER CALCULATOR */}
        {activeTab === 'calc' && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>
              {lang === 'en'
                ? 'Kerala Timber CFT Calculator'
                : 'കേരള തടി അളവ് കാൽക്കുലേറ്റർ'}
            </Text>
            <Text style={styles.sectionSub}>
              {lang === 'en'
                ? 'Official Kerala Forest & Mill Standard Formulas'
                : 'കേരള ഫോറസ്റ്റ് & മില്ലുകൾ അംഗീകരിച്ച കണക്കുകൂട്ടൽ'}
            </Text>

            {/* Mode Switcher */}
            <View style={styles.modeSwitchRow}>
              <TouchableOpacity
                style={[
                  styles.modeSwitchBtn,
                  calcMode === 'round' && styles.modeSwitchBtnActive,
                ]}
                onPress={() => setCalcMode('round')}
              >
                <Text
                  style={[
                    styles.modeSwitchText,
                    calcMode === 'round' && styles.modeSwitchTextActive,
                  ]}
                >
                  {lang === 'en' ? '🪵 Round Logs (Quarter-Girth)' : '🪵 ഉരുണ്ട തടി'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modeSwitchBtn,
                  calcMode === 'rectangular' && styles.modeSwitchBtnActive,
                ]}
                onPress={() => setCalcMode('rectangular')}
              >
                <Text
                  style={[
                    styles.modeSwitchText,
                    calcMode === 'rectangular' && styles.modeSwitchTextActive,
                  ]}
                >
                  {lang === 'en' ? '📐 Sawn Planks (Rectangular)' : '📐 അറുത്ത തടി'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* MODE 1: ROUND LOGS (QUARTER-GIRTH HOPPUS) */}
            {calcMode === 'round' ? (
              <View style={styles.calcBox}>
                <View style={styles.formulaPill}>
                  <Text style={styles.formulaText}>
                    Hoppus Formula: CFT = ((Girth/4)² × Length) / 144
                  </Text>
                </View>

                <Text style={styles.inputLabel}>
                  {lang === 'en' ? 'Log Length (Feet / അടി)' : 'നീളം (അടി)'}
                </Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={roundLengthFt}
                  onChangeText={setRoundLengthFt}
                />

                <Text style={styles.inputLabel}>
                  {lang === 'en'
                    ? 'Mid-Girth / Circumference (Inches / വണ്ണം ഇഞ്ച്)'
                    : 'നടുവണ്ണം (ഇഞ്ച്)'}
                </Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={roundGirthIn}
                  onChangeText={setRoundGirthIn}
                />

                <Text style={styles.inputLabel}>
                  {lang === 'en' ? 'Pieces (എണ്ണം)' : 'എണ്ണം'}
                </Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={roundPieces}
                  onChangeText={setRoundPieces}
                />

                <Text style={styles.inputLabel}>
                  {lang === 'en' ? 'Rate per CFT (₹)' : 'ഒരു CFT യുടെ വില (₹)'}
                </Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={roundRatePerCft}
                  onChangeText={setRoundRatePerCft}
                />

                {roundResult && (
                  <View style={styles.calcResultBox}>
                    <Text style={styles.calcResultLabel}>
                      {lang === 'en'
                        ? 'Quarter-Girth Total Volume'
                        : 'ആകെ തടി അളവ്'}
                    </Text>
                    <Text style={styles.calcResultValue}>
                      {roundResult.total_cft} CFT
                    </Text>
                    <Text style={styles.calcResultSub}>
                      ({roundResult.total_cft_m3} m³)
                    </Text>
                    {roundResult.estimated_cost && (
                      <View style={styles.priceRow}>
                        <Text style={styles.priceTagLabel}>
                          {lang === 'en' ? 'Estimated Total:' : 'ആകെ തുക:'}
                        </Text>
                        <Text style={styles.calcPriceValue}>
                          {formatINR(roundResult.estimated_cost)}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            ) : (
              /* MODE 2: RECTANGULAR SAWN PLANKS */
              <View style={styles.calcBox}>
                <View style={styles.formulaPill}>
                  <Text style={styles.formulaText}>
                    Formula: CFT = (L_ft × W_in × T_in / 144) × pieces
                  </Text>
                </View>

                <Text style={styles.inputLabel}>
                  {lang === 'en' ? 'Length (Feet / അടി)' : 'നീളം (അടി)'}
                </Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={rectLengthFt}
                  onChangeText={setRectLengthFt}
                />

                <Text style={styles.inputLabel}>
                  {lang === 'en' ? 'Width (Inches / വീതി ഇഞ്ച്)' : 'വീതി (ഇഞ്ച്)'}
                </Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={rectWidthIn}
                  onChangeText={setRectWidthIn}
                />

                <Text style={styles.inputLabel}>
                  {lang === 'en' ? 'Thickness (Inches / കനം ഇഞ്ച്)' : 'കനം (ഇഞ്ച്)'}
                </Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={rectThicknessIn}
                  onChangeText={setRectThicknessIn}
                />

                <Text style={styles.inputLabel}>
                  {lang === 'en' ? 'Pieces (എണ്ണം)' : 'എണ്ണം'}
                </Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={rectPieces}
                  onChangeText={setRectPieces}
                />

                <Text style={styles.inputLabel}>
                  {lang === 'en' ? 'Rate per CFT (₹)' : 'ഒരു CFT യുടെ വില (₹)'}
                </Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={rectRatePerCft}
                  onChangeText={setRectRatePerCft}
                />

                {rectResult && (
                  <View style={styles.calcResultBox}>
                    <Text style={styles.calcResultLabel}>
                      {lang === 'en' ? 'Total Volume' : 'ആകെ തടി അളവ്'}
                    </Text>
                    <Text style={styles.calcResultValue}>
                      {rectResult.total_cft} CFT
                    </Text>
                    <Text style={styles.calcResultSub}>
                      ({rectResult.total_cft_m3} m³)
                    </Text>
                    {rectResult.estimated_cost && (
                      <View style={styles.priceRow}>
                        <Text style={styles.priceTagLabel}>
                          {lang === 'en' ? 'Estimated Total:' : 'ആകെ തുക:'}
                        </Text>
                        <Text style={styles.calcPriceValue}>
                          {formatINR(rectResult.estimated_cost)}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* TAB 3: CARPENTERS */}
        {activeTab === 'carpenters' && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>
              {lang === 'en' ? 'Master Carpenters' : 'തച്ചന്മാർ (Carpenters)'}
            </Text>
            <Text style={styles.sectionSub}>
              {lang === 'en'
                ? 'Traditional joinery, roof framing, and wood sizing'
                : 'പരമ്പരാഗത ആശാരിമാർ & ജോയിനറി വിദഗ്ദ്ധർ'}
            </Text>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Master Binu Achari</Text>
              <Text style={styles.cardDetail}>
                25 yrs exp · Mavelikkara, Alappuzha
              </Text>
              <Text style={styles.cardSpec}>
                Traditional Roofing · Teak Doors · Timber Joinery
              </Text>
              <TouchableOpacity
                style={[styles.actionBtn, { marginTop: 12 }]}
                onPress={() =>
                  Alert.alert(
                    'Master Binu Achari',
                    '+91 98473 30001 · Available for site inspection across Alappuzha & Kottayam.'
                  )
                }
              >
                <Text style={styles.actionBtnText}>
                  {lang === 'en' ? 'Contact Carpenter' : 'വിളിക്കുക'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>K. R. Mohanan Achari</Text>
              <Text style={styles.cardDetail}>
                28 yrs exp · Changanassery, Kottayam
              </Text>
              <Text style={styles.cardSpec}>
                Roof Trussing · Sawn Planks Fitting · Wild Jack Specialist
              </Text>
              <TouchableOpacity
                style={[styles.actionBtn, { marginTop: 12 }]}
                onPress={() =>
                  Alert.alert(
                    'K. R. Mohanan Achari',
                    '+91 98473 30002 · Available for projects in Central Kerala.'
                  )
                }
              >
                <Text style={styles.actionBtnText}>
                  {lang === 'en' ? 'Contact Carpenter' : 'വിളിക്കുക'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* TAB 4: TRANSPORT */}
        {activeTab === 'transport' && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>
              {lang === 'en' ? 'Timber Heavy Haulage' : 'തടി ട്രാൻസ്പോർട്ട്'}
            </Text>
            <Text style={styles.sectionSub}>
              {lang === 'en'
                ? 'Crane trucks with Form IV Forest Pass permits'
                : 'ഫോറം IV ട്രാൻസിറ്റ് പെർമിറ്റുള്ള ഹെവി ലോറികൾ'}
            </Text>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Malabar Timber Transit Haulage</Text>
              <Text style={styles.cardDetail}>
                20-Tonne Crane Mounted · All Kerala Service
              </Text>
              <Text style={styles.cardSpec}>
                Round log self-loading crane · Inter-district forest permits
              </Text>
              <TouchableOpacity
                style={[styles.actionBtn, { marginTop: 12 }]}
                onPress={() =>
                  Alert.alert(
                    'Malabar Timber Transit',
                    'Contact: +91 98474 40001 · Fleet dispatch from Kozhikode & Ernakulam.'
                  )
                }
              >
                <Text style={styles.actionBtnText}>
                  {lang === 'en' ? 'Book Transit Truck' : 'ലോറി ബുക്ക് ചെയ്യുക'}
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
          <Text
            style={[styles.tabLabel, activeTab === 'market' && styles.tabActive]}
          >
            🪵 {lang === 'en' ? 'Market' : 'മാർക്കറ്റ്'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('calc')}
        >
          <Text
            style={[styles.tabLabel, activeTab === 'calc' && styles.tabActive]}
          >
            🧮 {lang === 'en' ? 'Calculator' : 'കണക്ക്'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('carpenters')}
        >
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'carpenters' && styles.tabActive,
            ]}
          >
            🔨 {lang === 'en' ? 'Carpenters' : 'ആശാരിമാർ'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('transport')}
        >
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'transport' && styles.tabActive,
            ]}
          >
            🚛 {lang === 'en' ? 'Transport' : 'ലോറി'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E7E1D6',
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4A3626',
    letterSpacing: 1,
  },
  logoSubtitle: {
    fontSize: 10,
    color: '#8E7F6B',
    fontWeight: '600',
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#5B6147',
  },
  langBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4A3626',
  },
  sectionSub: {
    fontSize: 12,
    color: '#8E7F6B',
    marginBottom: 12,
    marginTop: 2,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E7E1D6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  badgeTeak: {
    alignSelf: 'flex-start',
    backgroundColor: '#EAE5DB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeAnjili: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8EFE3',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeRosewood: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5E6E8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgePass: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F3E8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#5B6147',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4A3626',
  },
  badgePassText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5B6147',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C221E',
    marginBottom: 4,
  },
  cardDetail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  cardSpec: {
    fontSize: 11,
    color: '#8E7F6B',
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0EBE1',
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: '#5B6147',
  },
  actionBtn: {
    backgroundColor: '#4A3626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  modeSwitchRow: {
    flexDirection: 'row',
    backgroundColor: '#E7E1D6',
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
  },
  modeSwitchBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  modeSwitchBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modeSwitchText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  modeSwitchTextActive: {
    color: '#4A3626',
    fontWeight: '800',
  },
  formulaPill: {
    backgroundColor: '#F5F2EB',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E7E1D6',
  },
  formulaText: {
    fontSize: 11,
    color: '#5B6147',
    fontWeight: '700',
    textAlign: 'center',
  },
  calcBox: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7E1D6',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A3626',
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#D8D0C5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#2C221E',
    fontWeight: '600',
  },
  calcResultBox: {
    marginTop: 16,
    backgroundColor: '#F3EFE6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8D0C5',
  },
  calcResultLabel: {
    fontSize: 12,
    color: '#8E7F6B',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  calcResultValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4A3626',
    marginTop: 2,
  },
  calcResultSub: {
    fontSize: 12,
    color: '#8E7F6B',
    fontWeight: '600',
  },
  priceRow: {
    marginTop: 8,
    alignItems: 'center',
  },
  priceTagLabel: {
    fontSize: 11,
    color: '#5B6147',
    fontWeight: '600',
  },
  calcPriceValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#5B6147',
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E7E1D6',
    paddingVertical: 10,
    paddingBottom: 20,
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E7F6B',
  },
  tabActive: {
    color: '#4A3626',
    fontWeight: '800',
  },
});
