// Datumskorrekturen und Lückenfüller für CShapes 2.0.
import { boxPoly, intersect, difference } from '../../lib/geo.mjs';
import { Store } from '../../lib/store.mjs';

export function basicFixes(st) {
  // Danzig: Freie Stadt bis zum deutschen Überfall am 1.9.1939 (CShapes: 31.8.1938, offensichtlich ein Jahr zu früh)
  st.setDates(291, '1919-06-28', { e: '1939-08-31' });
  // CShapes schlägt Danzig schon ab 30.9.1938 dem Reich zu; bis 31.8.1939 wieder herauslösen
  st.carve(255, st.one(291, '1935-01-01'), '1938-09-30', '1939-08-31', { gw: 291 });

  // Baltikum: CShapes setzt das Ende auf den 1.6.1940. Formal annektiert wurden die drei Staaten
  // Anfang August 1940 (Litauen 3.8., Lettland 5.8., Estland 6.8.); vereinfacht: alle bis 2.8.1940.
  st.setDates(366, '1918-11-11', { e: '1940-08-02' });
  st.setDates(367, '1918-11-18', { e: '1940-08-02' });
  st.setDates(368, '1939-10-01', { e: '1940-08-02' });
  const baltics = Store.union([st.one(366, '1940-01-01'), st.one(367, '1940-01-01'), st.one(368, '1940-01-01')]);
  // UdSSR: Version ohne Baltikum bis zum 27.6.1940, danach mit Bessarabien, ab 3.8.1940 mit Baltikum
  st.setDates(365, '1940-03-12', { e: '1940-06-27' });
  st.remove(365, '1940-06-02');
  st.splitAt(365, '1940-08-03');
  const su = st.one(365, '1940-07-01');
  su.geometry = difference(su, baltics).geometry;

  // Kuwait und Bahrain: britische Protektorate vor der Unabhängigkeit fehlen in CShapes
  const kw = st.one(690, '1965-01-01');
  st.add(kw, { gw: 690, s: '1899-01-23', e: '1961-06-18' });
  const bh = st.one(692, '1975-01-01');
  st.add(bh, { gw: 692, s: '1880-12-22', e: '1971-08-14' });

  // Aden und Aden-Protektorat vor 1937 (bis dahin von Britisch-Indien aus verwaltet)
  st.setDates(681, '1937-04-01', { s: '1886-01-01' });
  st.setDates(6812, '1937-04-01', { s: '1886-01-01' });

  // Singapur: britische Kronkolonie bis zum Beitritt zu Malaysia am 16.9.1963
  st.setDates(830, '1946-04-01', { e: '1963-09-15' });

  // Neufundland trat Kanada erst am 31.3.1949 bei (CShapes: Referendum 22.7.1948)
  st.setDates(21, '1886-01-01', { e: '1949-03-31' });
  st.setDates(20, '1886-01-01', { e: '1949-03-31' });
  st.setDates(20, '1948-07-22', { s: '1949-04-01' });

  // Auflösung der UdSSR: CShapes nimmt die Ukraine (1.12.1991) bzw. Kasachstan, Armenien und
  // Aserbaidschan (21.12.1991) früher aus der UdSSR heraus, als die Staaten beginnen.
  st.setDates(369, '1991-12-26', { s: '1991-12-01' });
  st.setDates(705, '1991-12-26', { s: '1991-12-21' });
  st.setDates(371, '1991-12-26', { s: '1991-12-21' });
  st.setDates(373, '1991-12-26', { s: '1991-12-21' });

  // Petsamo blieb nach dem Winterkrieg finnisch und fiel erst mit dem Waffenstillstand 1944 an die UdSSR
  const fi1 = st.one(375, '1939-01-01');
  const petsamo = intersect(intersect(fi1, st.ref('RUS')), boxPoly([27.5, 68.6, 31.95, 70.2]));
  st.carve(365, petsamo, '1940-03-12', '1944-09-18', { gw: 375 });
}
