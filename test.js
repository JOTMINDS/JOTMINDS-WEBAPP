const lines = ["Name,DateOfBirth", "John Doe,2010-05-15", '"Jane Smith", "2011-08-22"', '"Smith, John",2012-09-01'];
for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  let parts = [];
  let current = '';
  let inQuotes = false;
  
  for (let j = 0; j < line.length; j++) {
    if (line[j] === '"') {
      inQuotes = !inQuotes;
    } else if (line[j] === ',' && !inQuotes) {
      parts.push(current);
      current = '';
    } else {
      current += line[j];
    }
  }
  parts.push(current);

  const name = parts[0].replace(/^"|"$/g, '').trim();
  const dob = parts.length > 1 ? parts[1].replace(/^"|"$/g, '').trim() : '';
  console.log(name, dob);
}
