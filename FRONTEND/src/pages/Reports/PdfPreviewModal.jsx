import { useRef } from 'react';
import { customers, reportCategories, buildReportRows } from './reportData';

const loadCompanyInfo = (companyNo) => {
  try {
    const list = JSON.parse(localStorage.getItem('wms_sa_companies') || '[]');
    return list.find(c => c.companyNo === companyNo) || null;
  } catch { return null; }
};

export default function PdfPreviewModal({ report, customer, dateFrom, dateTo, currentUser, onClose }) {
  const printRef = useRef();
  const cust    = customers.find(c => c.key === customer);
  const catInfo = reportCategories.find(r => r.key === report.type);
  const tableData = buildReportRows(report.type, customer);

  const companyInfo = loadCompanyInfo(currentUser?.companyNo);
  const companyName    = companyInfo?.name    || currentUser?.companyName || 'Samila WMS 3PL';
  const companyAddress = companyInfo?.address || '';
  const companyPhone   = companyInfo?.phone   || '';

  const handlePrint = () => {
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>${report.name}</title>
      <style>
        body{font-family:'Sarabun',Arial,sans-serif;margin:0;padding:24px;color:#222;font-size:12px;}
        .doc-header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #0d7ea8;padding-bottom:12px;margin-bottom:18px;}
        .doc-logo{font-size:20px;font-weight:800;color:#0d7ea8;}
        .doc-title{font-size:16px;font-weight:700;margin:8px 0 4px;}
        .doc-sub{font-size:11px;color:#666;}
        .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;background:#f5f8fa;border:1px solid #dce6eb;border-radius:4px;padding:12px 14px;margin-bottom:16px;}
        .info-label{font-size:10px;color:#888;text-transform:uppercase;}
        .info-val{font-size:12px;font-weight:600;margin-top:2px;}
        table{width:100%;border-collapse:collapse;margin-bottom:14px;}
        th{background:#0d7ea8;color:white;padding:8px 10px;text-align:left;font-size:11px;}
        td{padding:7px 10px;border-bottom:1px solid #e8eef2;font-size:11px;}
        tr:nth-child(even) td{background:#f5f8fa;}
        .footer-note{font-size:10px;color:#888;border-top:1px solid #ddd;padding-top:8px;margin-top:8px;}
        .total-row{font-weight:700;color:#0d7ea8;font-size:12px;margin-top:8px;}
        .sign-area{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:40px;}
        .sign-box{border-top:1px solid #999;padding-top:6px;font-size:11px;color:#555;text-align:center;}
      </style></head><body>
      <div class="doc-header">
        <div>
          <div class="doc-logo">${companyName}</div>
          <div style="font-size:10px;color:#888;">${companyAddress}${companyAddress && companyPhone ? ' | ' : ''}${companyPhone ? 'Tel: ' + companyPhone : ''}</div>
        </div>
        <div style="text-align:right;">
          <div class="doc-title">${report.name}</div>
          <div class="doc-sub">วันที่พิมพ์: ${new Date().toLocaleDateString('th-TH')}</div>
          <div class="doc-sub">Doc No.: RPT-${Date.now().toString().slice(-6)}</div>
        </div>
      </div>
      <div class="info-grid">
        <div><div class="info-label">ลูกค้า</div><div class="info-val">${cust?.name || '-'}</div></div>
        <div><div class="info-label">รหัสลูกค้า</div><div class="info-val">${cust?.code || '-'}</div></div>
        <div><div class="info-label">ช่วงวันที่</div><div class="info-val">${dateFrom} ถึง ${dateTo}</div></div>
        <div><div class="info-label">ประเภทรายงาน</div><div class="info-val">${catInfo?.label || report.name}</div></div>
      </div>
      <table>
        <thead><tr>${tableData.cols.map(c => `<th>${c}</th>`).join('')}</tr></thead>
        <tbody>${tableData.rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
      ${tableData.footer ? `<div class="total-row">${tableData.footer}</div>` : ''}
      <div class="footer-note">สร้างโดยระบบ ${companyName} | ${new Date().toLocaleString('th-TH')}</div>
      <div class="sign-area">
        <div class="sign-box">ผู้จัดทำ<br/><br/>______________________<br/>วันที่ ____________</div>
        <div class="sign-box">ผู้อนุมัติ<br/><br/>______________________<br/>วันที่ ____________</div>
      </div>
      </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 400);
  };

  return (
    <div className="pdf-overlay" onClick={onClose}>
      <div className="pdf-modal" onClick={e => e.stopPropagation()}>
        <div className="pdf-modal-header">
          <div className="pdf-modal-title">
            <span className="pdf-badge">PDF Preview</span>
            <span>{report.name}</span>
          </div>
          <div className="pdf-modal-actions">
            <button className="pdf-print-btn" onClick={handlePrint}>🖨️ Print / Save PDF</button>
            <button className="pdf-close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="pdf-scroll-area" ref={printRef}>
          <div className="pdf-doc">
            <div className="pdf-doc-header">
              <div className="pdf-doc-company">
                <div className="pdf-doc-logo">{companyName}</div>
                <div className="pdf-doc-addr">
                  {companyAddress && <>{companyAddress}<br /></>}
                  {companyPhone && <>Tel: {companyPhone}</>}
                </div>
              </div>
              <div className="pdf-doc-title-block">
                <div className="pdf-doc-rpt-title">{catInfo?.icon} {catInfo?.label || report.name}</div>
                <div className="pdf-doc-rpt-date">วันที่สร้าง: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                <div className="pdf-doc-rpt-date">Doc No.: RPT-{Date.now().toString().slice(-6)}</div>
              </div>
            </div>

            <div className="pdf-info-grid">
              <div className="pdf-info-cell"><div className="pdf-info-label">ลูกค้า</div><div className="pdf-info-val">{cust?.name}</div></div>
              <div className="pdf-info-cell"><div className="pdf-info-label">รหัสลูกค้า</div><div className="pdf-info-val">{cust?.code}</div></div>
              <div className="pdf-info-cell"><div className="pdf-info-label">ผู้ติดต่อ</div><div className="pdf-info-val">{cust?.contact}</div></div>
              <div className="pdf-info-cell"><div className="pdf-info-label">ช่วงวันที่</div><div className="pdf-info-val">{dateFrom} – {dateTo}</div></div>
            </div>

            <table className="pdf-table">
              <thead>
                <tr>
                  <th className="pdf-th-num">#</th>
                  {tableData.cols.map((col, i) => <th key={i}>{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {tableData.rows.map((row, ri) => (
                  <tr key={ri} className={ri % 2 === 1 ? 'pdf-tr-alt' : ''}>
                    <td className="pdf-td-num">{ri + 1}</td>
                    {row.map((cell, ci) => <td key={ci}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>

            {tableData.footer && <div className="pdf-total-row">{tableData.footer}</div>}

            <div className="pdf-summary-row">
              <div className="pdf-summary-cell"><div className="pdf-summary-label">จำนวนแถว</div><div className="pdf-summary-val">{tableData.rows.length} รายการ</div></div>
              <div className="pdf-summary-cell"><div className="pdf-summary-label">สร้างโดย</div><div className="pdf-summary-val">{companyName}</div></div>
              <div className="pdf-summary-cell"><div className="pdf-summary-label">วันที่พิมพ์</div><div className="pdf-summary-val">{new Date().toLocaleString('th-TH')}</div></div>
            </div>

            <div className="pdf-sign-area">
              <div className="pdf-sign-box"><div className="pdf-sign-line"></div><div className="pdf-sign-label">ผู้จัดทำ</div><div className="pdf-sign-date">วันที่ ___________</div></div>
              <div className="pdf-sign-box"><div className="pdf-sign-line"></div><div className="pdf-sign-label">ผู้ตรวจสอบ</div><div className="pdf-sign-date">วันที่ ___________</div></div>
              <div className="pdf-sign-box"><div className="pdf-sign-line"></div><div className="pdf-sign-label">ผู้อนุมัติ</div><div className="pdf-sign-date">วันที่ ___________</div></div>
            </div>

            <div className="pdf-footer-note">
              รายงานนี้สร้างโดยระบบ {companyName} อัตโนมัติ — ข้อมูล ณ วันที่ {new Date().toLocaleDateString('th-TH')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
