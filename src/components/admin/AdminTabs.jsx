import styles from '../../pages/AdminPage.module.css';

const tabs = [
  { id: 'bag', label: '아이템 조정' },
  { id: 'dex', label: '도감 해금' },
];

export default function AdminTabs({ activeTab, onChange }) {
  console.log(activeTab, activeTab === 'bag', activeTab === 'dex');
  return (
    <div className={styles.tabs}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type='button'
          className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
