import React, { useState, ReactElement } from 'react';
import { IndexPath, Layout, Select, SelectItem } from '@ui-kitten/components';
import signup from '../../ui/SignUpStyles';

export default function GradeLevelDropDownSelection(): ReactElement {
  const [selectedIndex, setSelectedIndex] = useState<IndexPath | IndexPath[]>(
    new IndexPath(0),
  );

  const gradeLevel = ['Grade 1', 'Grade 2', 'Grade 3'];
  const displayValue = Array.isArray(selectedIndex) 
    ? gradeLevel[selectedIndex[0]?.row] || gradeLevel[0]
    : gradeLevel[selectedIndex.row] || gradeLevel[0];

  return (
    <Layout style={signup.dropdownContainer}>
      <Select
        selectedIndex={selectedIndex}
        onSelect={index => setSelectedIndex(index as IndexPath)}
        // value={gradeLevel[(selectedIndex as IndexPath).row]}
        value={displayValue}
        placeholder='Select Grade Level'
      >
        {gradeLevel.map((grade, index) => (
          <SelectItem key={index} title={grade} />
        ))}
      </Select>
    </Layout>
  );
}
