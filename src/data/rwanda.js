const provinces = [
  {
    name: 'Kigali City',
    districts: ['Nyarugenge', 'Gasabo', 'Kicukiro'],
  },
  {
    name: 'Eastern Province',
    districts: ['Rwamagana', 'Nyagatare', 'Gatsibo', 'Kayonza', 'Kirche', 'Ngoma', 'Bugesera'],
  },
  {
    name: 'Northern Province',
    districts: ['Musanze', 'Burera', 'Gicumbi', 'Rulindo', 'Gakenke'],
  },
  {
    name: 'Western Province',
    districts: ['Rusizi', 'Nyamasheke', 'Karongi', 'Rutsiro', 'Ngororero', 'Nyabihu', 'Rubavu'],
  },
  {
    name: 'Southern Province',
    districts: ['Huye', 'Nyanza', 'Gisagara', 'Nyamagabe', 'Muhanga', 'Kamonyi', 'Ruhango'],
  },
];

const allDistricts = provinces.flatMap((p) =>
  p.districts.map((d) => ({ district: d, province: p.name }))
);

const provinceColors = {
  'Kigali City': 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400',
  'Eastern Province': 'bg-green-500/20 border-green-500/40 text-green-400',
  'Northern Province': 'bg-blue-500/20 border-blue-500/40 text-blue-400',
  'Western Province': 'bg-purple-500/20 border-purple-500/40 text-purple-400',
  'Southern Province': 'bg-orange-500/20 border-orange-500/40 text-orange-400',
};

const provinceBgMap = {
  'Kigali City': 'bg-yellow-500/5',
  'Eastern Province': 'bg-green-500/5',
  'Northern Province': 'bg-blue-500/5',
  'Western Province': 'bg-purple-500/5',
  'Southern Province': 'bg-orange-500/5',
};

export { provinces, allDistricts, provinceColors, provinceBgMap };
