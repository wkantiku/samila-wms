// WMS Unit Master — Main Unit & Sub Unit
// ข้อมูลจากตาราง Main Unit / Sub Unit

export const MAIN_UNIT_GROUPS = [
  {
    group: 'หน่วยนับพื้นฐาน',
    units: [
      { value: 'PCS',    label: 'ชิ้น – PCS' },
      { value: 'UNIT',   label: 'อัน – Unit' },
      { value: 'PELLET', label: 'เม็ด – Pellet' },
      { value: 'LEAF',   label: 'ใบ – Leaf' },
      { value: 'SHEET',  label: 'แผ่น – Sheet' },
      { value: 'BTL',    label: 'ขวด – Bottle' },
      { value: 'CAN',    label: 'กระป๋อง – Can' },
    ],
  },
  {
    group: 'หน่วยบรรจุภัณฑ์',
    units: [
      { value: 'CARTON', label: 'กล่อง – Carton' },
      { value: 'BOX',    label: 'กล่อง – Box' },
      { value: 'SACHET', label: 'ซอง – Sachet' },
      { value: 'PACK',   label: 'แพ็ค – Pack' },
      { value: 'BUNDLE', label: 'มัด – Bundle' },
      { value: 'BAG',    label: 'ถุง – Bag' },
      { value: 'PALLET', label: 'พาเลท – Pallet' },
    ],
  },
  {
    group: 'หน่วยน้ำหนัก',
    units: [
      { value: 'G',   label: 'กรัม – Gram' },
      { value: 'KG',  label: 'กิโลกรัม – KG' },
      { value: 'TON', label: 'ตัน – Ton' },
      { value: 'LB',  label: 'ปอนด์ – Pound' },
    ],
  },
  {
    group: 'หน่วยปริมาตร',
    units: [
      { value: 'ML',  label: 'มิลลิลิตร – Milliliter' },
      { value: 'L',   label: 'ลิตร – Liter' },
      { value: 'GAL', label: 'แกลลอน – Gallon' },
    ],
  },
  {
    group: 'หน่วยความยาว / พื้นที่',
    units: [
      { value: 'M',   label: 'เมตร – M' },
      { value: 'CM',  label: 'เซนติเมตร – CM' },
      { value: 'M2',  label: 'ตารางเมตร – Sq.M' },
      { value: 'FT2', label: 'ตารางฟุต – Sq.F' },
      { value: 'CBM', label: 'ลูกบาศก์เมตร – CBM' },
    ],
  },
];

export const SUB_UNIT_GROUPS = [
  {
    group: 'หน่วยนับพื้นฐาน',
    units: [
      { value: 'PCS',    label: 'ชิ้น – PCS' },
      { value: 'UNIT',   label: 'อัน – Unit' },
      { value: 'PELLET', label: 'เม็ด – Pellet' },
      { value: 'LEAF',   label: 'ใบ – Leaf' },
      { value: 'SHEET',  label: 'แผ่น – Sheet' },
      { value: 'BTL',    label: 'ขวด – Bottle' },
      { value: 'CAN',    label: 'กระป๋อง – Can' },
    ],
  },
  {
    group: 'หน่วยบรรจุภัณฑ์',
    units: [
      { value: 'BOX',    label: 'กล่อง – Box' },
      { value: 'SACHET', label: 'ซอง – Sachet' },
      { value: 'PACK',   label: 'แพ็ค – Pack' },
      { value: 'BUNDLE', label: 'มัด – Bundle' },
      { value: 'BAG',    label: 'ถุง – Bag' },
    ],
  },
  {
    group: 'หน่วยน้ำหนัก',
    units: [
      { value: 'G',   label: 'กรัม – Gram' },
      { value: 'KG',  label: 'กิโลกรัม – KG' },
      { value: 'TON', label: 'ตัน – Ton' },
      { value: 'LB',  label: 'ปอนด์ – Pound' },
    ],
  },
  {
    group: 'หน่วยปริมาตร',
    units: [
      { value: 'ML',  label: 'มิลลิลิตร – Milliliter' },
      { value: 'L',   label: 'ลิตร – Liter' },
      { value: 'GAL', label: 'แกลลอน – Gallon' },
    ],
  },
  {
    group: 'หน่วยความยาว / พื้นที่',
    units: [
      { value: 'M',   label: 'เมตร – M' },
      { value: 'CM',  label: 'เซนติเมตร – CM' },
      { value: 'M2',  label: 'ตารางเมตร – Sq.M' },
      { value: 'FT2', label: 'ตารางฟุต – Sq.F' },
      { value: 'CBM', label: 'ลูกบาศก์เมตร – CBM' },
    ],
  },
];

// UNIT_GROUPS = Main Unit (ใช้สำหรับ filter, receiving, inventory)
export const UNIT_GROUPS = MAIN_UNIT_GROUPS;

export const ALL_UNITS = UNIT_GROUPS.flatMap(g => g.units);
export const ALL_MAIN_UNITS = MAIN_UNIT_GROUPS.flatMap(g => g.units);
export const ALL_SUB_UNITS = SUB_UNIT_GROUPS.flatMap(g => g.units);

export const UNIT_LABEL = Object.fromEntries(ALL_UNITS.map(u => [u.value, u.label]));
