(() => {
  'use strict';

  const DB_KEY = 'ar7-oficina-db-v2';
  const APP_VERSION = 20.2;
  const APP_RELEASE = '20.2.3';
  const STAGES = [
    { id: 'entrada', label: 'Recebimento', team: 'Recepção', short: 'Receber e conferir' },
    { id: 'diagnostico', label: 'Diagnóstico', team: 'Oficina', short: 'Desmontar e diagnosticar' },
    { id: 'aprovacao', label: 'Aprovação do cliente', team: 'Comercial / Cliente', short: 'Aprovar escopo e orçamento' },
    { id: 'pecas', label: 'Peças e compras', team: 'Compras', short: 'Comprar e separar peças' },
    { id: 'montagem', label: 'Montagem', team: 'Oficina', short: 'Executar a montagem' },
    { id: 'testes', label: 'Testes finais', team: 'Qualidade', short: 'Medir e validar' },
    { id: 'relatorio', label: 'Relatório e envio', team: 'Administrativo', short: 'Revisar e enviar' },
    { id: 'concluida', label: 'Concluída', team: 'Cliente / Entrega', short: 'Disponível para retirada' }
  ];
  const PART_STATUSES = ['Solicitada', 'Em cotação', 'Comprada', 'Recebida', 'Separada', 'Instalada'];
  const EQUIPMENT_TYPES = ['Motoredutor','Motor elétrico','Bomba','Redutor','Ventilador','Compressor','Exaustor','Gerador','Outro'];
  const MANUFACTURERS = ['WEG','SEW','Siemens','KSB','Schneider','ABB','NORD','Bonfiglioli','Voges','Marathon','OTAM'];
  const COMMON_PARTS = ['Rolamento','Retentor','Selo mecânico','O-ring','Ventoinha','Tampa','Eixo','Bucha','Acoplamento','Junta','Bobina','Capacitor'];

  const icon = (name, size = 20) => {
    const paths = {
      menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
      home:'<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/>',
      clipboard:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 9h6M9 13h6M9 17h4"/>',
      users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
      motor:'<rect x="4" y="7" width="13" height="10" rx="2"/><path d="M17 10h3v4h-3M7 7V4h7v3M7 17v3h7v-3M7 10h7M7 14h7"/>',
      gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.35.24.78.38 1.2.4h.1v4h-.1c-.42.02-.85.16-1.2.4Z"/>',
      tools:'<path d="m14.7 6.3 3-3a2.8 2.8 0 0 1-3.9 3.9l-7.7 7.7a2 2 0 1 0 2.8 2.8l7.7-7.7a2.8 2.8 0 0 1 3.9-3.9l-3 3"/><path d="m5 3 4 4M3 5l4 4"/>',
      chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
      globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>',
      bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
      help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.7 2.7 0 1 1 4.2 2.25c-.9.6-1.7 1.1-1.7 2.25M12 17h.01"/>',
      plus:'<path d="M12 5v14M5 12h14"/>',
      search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
      alert:'<path d="M10.3 3.7 2.3 18a2 2 0 0 0 1.7 3h16a2 2 0 0 0 1.7-3l-8-14.3a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
      clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
      file:'<path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 12h6M9 16h6"/>',
      check:'<path d="m5 12 4 4L19 6"/>',
      camera:'<path d="M4 7h4l2-3h4l2 3h4v13H4z"/><circle cx="12" cy="13" r="4"/>',
      save:'<path d="M5 3h12l2 2v16H5z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/>',
      send:'<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
      download:'<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
      trash:'<path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6"/>',
      edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>',
      arrow:'<path d="M5 12h14M14 7l5 5-5 5"/>',
      box:'<path d="m3 7 9-4 9 4-9 4Z"/><path d="m3 7 9 4 9-4v10l-9 4-9-4Z"/><path d="M12 11v10"/>',
      filter:'<path d="M4 5h16l-6 7v6l-4 2v-8Z"/>',
      close:'<path d="m6 6 12 12M18 6 6 18"/>'
    };
    return `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.file}</svg>`;
  };

  function svgPhoto(label, tone = '#0d568f') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${tone}"/><stop offset="1" stop-color="#071f3b"/></linearGradient></defs><rect width="600" height="420" fill="url(#g)"/><circle cx="190" cy="210" r="95" fill="none" stroke="#d8e8f4" stroke-width="25"/><circle cx="190" cy="210" r="35" fill="#d8e8f4"/><rect x="270" y="135" width="210" height="150" rx="24" fill="#eaf3f8"/><path d="M300 165h145M300 200h145M300 235h145" stroke="#3985ad" stroke-width="18" stroke-linecap="round"/><text x="300" y="365" text-anchor="middle" font-family="Arial" font-size="28" fill="white">${label}</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  const seedDB = () => ({
    version: APP_VERSION,
    company: { name: 'AR7 Elétrica', unit: 'Matriz', email: 'relatorios@ar7eletrica.com.br' },
    catalog: { equipmentDescriptions:['Motor WEG 3 cv','Motor SEW 5 cv','Motor Siemens 10 cv','Bomba KSB 80-200','Motoredutor SEW R87'], manufacturers:MANUFACTURERS, partNames:COMMON_PARTS },
    clients: [
      { id:'c1', name:'Sanepar', contact:'Marcos Lima', email:'manutencao@sanepar.com.br', active:true },
      { id:'c2', name:'Ceará Alimentos', contact:'Paulo Mendes', email:'engenharia@cearaalimentos.com.br', active:true },
      { id:'c3', name:'Usina Verde', contact:'Carla Souza', email:'manutencao@usinaverde.com.br', active:true },
      { id:'c4', name:'Metalúrgica JL', contact:'Renato Alves', email:'pcm@metalurgicajl.com.br', active:true }
    ],
    equipment: [
      { id:'e1', clientId:'c1', tag:'BBA-205', description:'Bomba KSB 80-200 30 cv', type:'Bomba', manufacturer:'KSB', model:'80-200', power:'30 cv / 22 kW / 4P', serial:'KSB-88931' },
      { id:'e2', clientId:'c2', tag:'MTR-302', description:'Motor WEG W22 50 cv', type:'Motor elétrico', manufacturer:'WEG', model:'W22 Alto Rendimento', power:'50 cv / 37 kW / 4P', serial:'WEG-143872' },
      { id:'e3', clientId:'c3', tag:'MTR-409', description:'Motor WEG W21 75 cv', type:'Motor elétrico', manufacturer:'WEG', model:'W21', power:'75 cv / 55 kW / 4P', serial:'WEG-762110' },
      { id:'e4', clientId:'c4', tag:'RED-707', description:'Redutor SEW R87 i=18,2', type:'Redutor', manufacturer:'SEW', model:'R87', power:'i=18,2', serial:'SEW-902211' },
      { id:'e5', clientId:'c1', tag:'MTR-101', description:'Motor WEG W22 20 cv', type:'Motor elétrico', manufacturer:'WEG', model:'W22', power:'20 cv / 15 kW / 4P', serial:'WEG-351112' },
      { id:'e6', clientId:'c3', tag:'VNT-501', description:'Ventilador OTAM VTR-600 15 cv', type:'Ventilador', manufacturer:'OTAM', model:'VTR-600', power:'15 cv', serial:'OT-33019' }
    ],
    orders: [
      {
        id:'o1247', number:'1247', clientId:'c1', equipmentId:'e1', entryDate:'2026-08-01', dueDate:'2026-08-10',
        stage:'pecas', defect:'Ruído excessivo e vibração elevada', technician:'João Silva', supervisor:'Carlos Alberto',
        notes:'Rolamentos com desgaste avançado e folga axial acima do especificado. Ruído causado por falha nos rolamentos e desalinhamento leve no acoplamento.',
        parts:[
          {id:'p1',name:'Rolamento dianteiro',code:'6208-2RS1',dimensions:'40 × 80 × 18 mm',quantity:'1',unit:'un',position:'Mancal dianteiro',technicalNote:'Blindado 2RS; confirmar folga conforme aplicação.',status:'Recebida',requestedBy:'João Silva',purchase:{supplier:'Rolamentos ABC',expectedDate:'2026-08-05',quote:'',price:'',note:'',location:'Caixa OS 1247'}},
          {id:'p2',name:'Rolamento traseiro',code:'6206-2RS1',dimensions:'30 × 62 × 16 mm',quantity:'1',unit:'un',position:'Mancal traseiro',technicalNote:'Blindado 2RS; confirmar folga conforme aplicação.',status:'Recebida',requestedBy:'João Silva',purchase:{supplier:'Rolamentos ABC',expectedDate:'2026-08-05',quote:'',price:'',note:'',location:'Caixa OS 1247'}},
          {id:'p3',name:'Retentor',code:'RET-TC',dimensions:'45 × 62 × 10 mm',quantity:'1',unit:'un',position:'Eixo dianteiro',technicalNote:'Perfil TC; material compatível com óleo e temperatura de trabalho.',status:'Comprada',requestedBy:'João Silva',purchase:{supplier:'Vedatec',expectedDate:'2026-08-07',quote:'',price:'',note:'',location:'Aguardando entrega'}},
          {id:'p4',name:'Vedação O-Ring',code:'AS-568-214',dimensions:'25,07 × 3,53 mm',quantity:'1',unit:'un',position:'Tampa do mancal',technicalNote:'Confirmar material conforme fluido e temperatura.',status:'Solicitada',requestedBy:'João Silva',purchase:{supplier:'',expectedDate:'',quote:'',price:'',note:'',location:''}}
        ],
        measurements:[
          {name:'Vibração radial X',unit:'mm/s',before:'6,8',after:'2,1',limit:'≤ 4,5'},
          {name:'Vibração radial Y',unit:'mm/s',before:'7,2',after:'2,3',limit:'≤ 4,5'},
          {name:'Temperatura mancal D.E.',unit:'°C',before:'68,5',after:'42,3',limit:'≤ 80'},
          {name:'Corrente do motor',unit:'A',before:'18,6',after:'17,9',limit:'≤ 24'}
        ],
        photos:{before:[svgPhoto('Antes do serviço','#285d86')],during:[svgPhoto('Durante o serviço','#8f5e22')],after:[]},
        report:{approved:false,sent:false,scheduledAt:'',sentAt:'',recipient:'manutencao@sanepar.com.br'}
      },
      {
        id:'o1243', number:'1243', clientId:'c2', equipmentId:'e2', entryDate:'2026-07-29', dueDate:'2026-08-08', stage:'aprovacao', defect:'Baixa isolação', technician:'Mário Santos', supervisor:'Carlos Alberto', notes:'Diagnóstico concluído e proposta encaminhada para avaliação do cliente.', records:{diagnosis:'Foi identificada baixa resistência de isolamento nos enrolamentos, com necessidade de limpeza técnica, secagem controlada, reimpregnação e nova bateria de ensaios antes da montagem.',assembly:'',tests:'',conclusion:'',recommendations:''}, approval:{required:true,status:'Aguardando aprovação',scope:'Limpeza técnica, secagem controlada, reimpregnação dos enrolamentos e ensaios elétricos finais.',amount:'4850.00',terms:'Prazo estimado de 7 dias úteis após a aprovação e disponibilidade dos materiais.',recipient:'engenharia@cearaalimentos.com.br',sentAt:'2026-08-05T14:00:00',decidedAt:'',decidedBy:'',clientComment:'',validUntil:'2026-08-12'}, parts:[], noPartsRequired:true, measurements:[], photos:{before:[svgPhoto('Motor recebido','#3b5b7f')],during:[svgPhoto('Diagnóstico elétrico','#7b552a')],after:[]}, report:{approved:false,sent:false,scheduledAt:'',sentAt:'',recipient:'engenharia@cearaalimentos.com.br'}
      },
      {
        id:'o1239', number:'1239', clientId:'c3', equipmentId:'e3', entryDate:'2026-07-22', dueDate:'2026-08-03', stage:'montagem', defect:'Queima de bobinamento', technician:'Pedro Lima', supervisor:'Carlos Alberto', notes:'Rebobinamento concluído. Em processo de montagem e balanceamento.', parts:[{id:'p5',name:'Rolamento 6312 C3',code:'6312-C3',qty:'2 un',status:'Instalada',responsible:'Pedro Lima',supplier:'SKF',due:'2026-07-28',location:'Instalada'}], measurements:[{name:'Resistência de isolação',unit:'GΩ',before:'0,02',after:'8,4',limit:'≥ 1'}], photos:{before:[svgPhoto('Bobinamento danificado','#704148')],during:[svgPhoto('Rebobinamento','#7b552a')],after:[]}, report:{approved:false,sent:false,scheduledAt:'',sentAt:'',recipient:'manutencao@usinaverde.com.br'}
      },
      {
        id:'o1236', number:'1236', clientId:'c1', equipmentId:'e5', entryDate:'2026-07-18', dueDate:'2026-08-01', stage:'testes', defect:'Aquecimento no mancal', technician:'João Silva', supervisor:'Carlos Alberto', notes:'Peças substituídas, equipamento em testes finais.', parts:[{id:'p6',name:'Rolamento 6309 C3',code:'6309-C3',qty:'2 un',status:'Instalada',responsible:'João Silva',supplier:'NSK',due:'2026-07-22',location:'Instalada'}], measurements:[{name:'Vibração global',unit:'mm/s',before:'8,1',after:'1,9',limit:'≤ 4,5'}], photos:{before:[svgPhoto('Antes','#385d7e')],during:[svgPhoto('Substituição','#7e5b35')],after:[svgPhoto('Equipamento pronto','#18745a')]}, report:{approved:false,sent:false,scheduledAt:'',sentAt:'',recipient:'manutencao@sanepar.com.br'}
      },
      {
        id:'o1231', number:'1231', clientId:'c3', equipmentId:'e6', entryDate:'2026-07-12', dueDate:'2026-07-25', stage:'concluida', defect:'Vibração estrutural', technician:'Pedro Lima', supervisor:'Carlos Alberto', notes:'Serviço concluído com balanceamento dinâmico e substituição de rolamentos.', parts:[{id:'p7',name:'Rolamento 22210',code:'22210-E',qty:'2 un',status:'Instalada',responsible:'Pedro Lima',supplier:'FAG',due:'2026-07-16',location:'Instalada'}], measurements:[{name:'Vibração global',unit:'mm/s',before:'10,2',after:'2,0',limit:'≤ 4,5'}], photos:{before:[svgPhoto('Antes','#3a5878')],during:[svgPhoto('Balanceamento','#775625')],after:[svgPhoto('Finalizado','#18745a')]}, report:{approved:true,sent:true,scheduledAt:'',sentAt:'2026-07-25T16:30',recipient:'manutencao@usinaverde.com.br'}
      },
      {
        id:'o1229', number:'1229', clientId:'c4', equipmentId:'e4', entryDate:'2026-08-02', dueDate:'2026-08-14', stage:'entrada', defect:'Vazamento de óleo e ruído', technician:'A definir', supervisor:'Carlos Alberto', notes:'', parts:[], measurements:[], photos:{before:[],during:[],after:[]}, report:{approved:false,sent:false,scheduledAt:'',sentAt:'',recipient:'pcm@metalurgicajl.com.br'}
      }
    ],
    activity:[
      {id:'a1',at:'2026-08-05T14:20',text:'Retentor da OS #1247 marcado como comprado.'},
      {id:'a2',at:'2026-08-05T10:15',text:'Relatório da OS #1231 enviado ao cliente.'},
      {id:'a3',at:'2026-08-04T16:40',text:'Nova OS #1229 cadastrada para Metalúrgica JL.'}
    ]
  });

  let db = normalizeAfterLoadV5(loadDB());
  saveDB();
  let currentModal = null;
  let newOrderDraft = null;
  let arrowEditorState = null;

  function migrateDB(parsed) {
    if (!parsed || !Array.isArray(parsed.orders)) return null;
    parsed.version = APP_VERSION;
    parsed.company = { name:'AR7 Elétrica', unit:'Matriz', email:'relatorios@ar7eletrica.com.br', ...(parsed.company || {}) };
    if (parsed.company.name === 'Oficina Central') parsed.company.name = 'AR7 Elétrica';
    parsed.clients = Array.isArray(parsed.clients) ? parsed.clients : [];
    parsed.equipment = (Array.isArray(parsed.equipment) ? parsed.equipment : []).map(eq => ({
      ...eq,
      tag: eq.tag || eq.internalCode || '',
      description: eq.description || [eq.type,eq.manufacturer,eq.model,eq.power].filter(Boolean).join(' ').replace(/\s+/g,' ').trim(),
      type: eq.type || 'Equipamento', manufacturer:eq.manufacturer || '', model:eq.model || '', power:eq.power || '', serial:eq.serial || ''
    }));
    parsed.catalog = {
      equipmentDescriptions: [], manufacturers: MANUFACTURERS, partNames: COMMON_PARTS,
      ...(parsed.catalog || {})
    };
    parsed.catalog.equipmentDescriptions = [...new Set([
      ...(parsed.catalog.equipmentDescriptions || []), ...parsed.equipment.map(e=>e.description).filter(Boolean)
    ])];
    parsed.catalog.manufacturers = [...new Set([...(parsed.catalog.manufacturers || []), ...MANUFACTURERS])];
    parsed.catalog.partNames = [...new Set([...(parsed.catalog.partNames || []), ...COMMON_PARTS])];
    parsed.orders = parsed.orders.map(order => ({
      ...order,
      stage: STAGES.some(stage => stage.id === order.stage) ? order.stage : 'entrada',
      noPartsRequired: Boolean(order.noPartsRequired),
      createdAt: order.createdAt || `${order.entryDate || todayISO()}T08:00:00`,
      availableSince: order.availableSince || new Date().toISOString(),
      handoffs: Array.isArray(order.handoffs) ? order.handoffs : [],
      reception: {
        receivedBy: order.reception?.receivedBy || '', condition: order.reception?.condition || '', accessories: order.reception?.accessories || ''
      },
      report: { approved:false, sent:false, scheduledAt:'', sentAt:'', recipient:'', ...(order.report || {}) },
      photos: { before:[], during:[], after:[], ...(order.photos || {}) },
      parts: (Array.isArray(order.parts) ? order.parts : []).map(part => {
        const qtyText=String(part.qty || '').trim();
        const qtyMatch=qtyText.match(/^([\d.,]+)\s*(.*)$/);
        const knownDimensions = ({p1:'40 × 80 × 18 mm',p2:'30 × 62 × 16 mm',p3:'45 × 62 × 10 mm',p4:'25,07 × 3,53 mm'})[part.id] || '';
        const normalizedCode = part.id === 'p3' && /^45\s*[x×]\s*62\s*[x×]\s*10/i.test(String(part.code || '')) ? 'RET-TC' : (part.code || '');
        return {
          ...part,
          name:part.name || 'Peça', code:normalizedCode, dimensions:part.dimensions || knownDimensions,
          quantity:part.quantity || qtyMatch?.[1] || '1', unit:part.unit || qtyMatch?.[2] || 'un',
          position:part.position || '', technicalNote:part.technicalNote || '', requestedBy:part.requestedBy || part.responsible || 'Oficina', photo:part.photo || '',
          purchase:{ supplier:part.purchase?.supplier || part.supplier || '', expectedDate:part.purchase?.expectedDate || part.due || '', quote:part.purchase?.quote || '', price:part.purchase?.price || '', note:part.purchase?.note || '', location:part.purchase?.location || part.location || '' }
        };
      }),
      measurements: Array.isArray(order.measurements) ? order.measurements : []
    }));
    parsed.activity = Array.isArray(parsed.activity) ? parsed.activity : [];
    return parsed;
  }

  function loadDB() {
    try {
      const parsed = migrateDB(JSON.parse(localStorage.getItem(DB_KEY)));
      if (parsed) { localStorage.setItem(DB_KEY, JSON.stringify(parsed)); return parsed; }
    } catch (error) { console.warn('Banco local inválido', error); }
    const initial = migrateDB(seedDB());
    localStorage.setItem(DB_KEY, JSON.stringify(initial));
    return initial;
  }
  function saveDB() {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(db));
      return true;
    } catch (error) {
      console.error('Falha ao salvar banco local', error);
      const message = error?.name === 'QuotaExceededError'
        ? 'O armazenamento deste dispositivo ficou cheio. Exporte um backup e remova fotos desnecessárias.'
        : 'Não foi possível salvar os dados neste dispositivo.';
      if (document.getElementById('toast-region')) toast(message,'error');
      return false;
    }
  }
  function id(prefix='id') { return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2,6)}`; }
  function getClient(idValue) { return db.clients.find(item => item.id === idValue); }
  function getEquipment(idValue) { return db.equipment.find(item => item.id === idValue); }
  function getOrder(idValue) { return db.orders.find(item => item.id === idValue); }
  function validDate(value, dateOnly=false) {
    if (!value) return null;
    const raw=String(value);
    const date=new Date(dateOnly&&!raw.includes('T')?`${raw}T12:00:00`:raw);
    return Number.isNaN(date.getTime())?null:date;
  }
  function formatDate(value) { const d=validDate(value,true); return d?new Intl.DateTimeFormat('pt-BR').format(d):'—'; }
  function formatDateTime(value) { const d=validDate(value); return d?new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(d):'—'; }
  function todayISO() { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
  function stageIndex(stage) { return Math.max(0, STAGES.findIndex(item => item.id === stage)); }
  function stageLabel(stage) { return STAGES.find(item => item.id === stage)?.label || stage; }
  function stageTeam(stage) { return STAGES.find(item => item.id === stage)?.team || 'Equipe'; }
  function nextStage(stage) { const index=stageIndex(stage); return STAGES[Math.min(index+1,STAGES.length-1)]; }
  function nextOrderNumber() {
    const year = new Date().getFullYear();
    const sequence = db.orders.reduce((max, order) => {
      const match = String(order.number || '').match(new RegExp(`^${year}-(\\d{4})$`));
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0) + 1;
    return `${year}-${String(sequence).padStart(4,'0')}`;
  }
  function equipmentDescription(eq) {
    return (eq?.description || [eq?.type,eq?.manufacturer,eq?.model,eq?.power].filter(Boolean).join(' ')).replace(/\s+/g,' ').trim() || 'Equipamento sem descrição';
  }
  function nextEquipmentCode() {
    let n=db.equipment.length+1, code='';
    do { code=`EQ-${String(n++).padStart(4,'0')}`; } while(db.equipment.some(eq=>eq.tag===code));
    return code;
  }
  function parseEquipmentDescription(text) {
    const description=String(text||'').trim().replace(/\s+/g,' ');
    const lower=description.toLocaleLowerCase('pt-BR');
    const type=EQUIPMENT_TYPES.find(item=>lower.includes(item.toLocaleLowerCase('pt-BR').replace(' elétrico',''))) || (lower.includes('motor')?'Motor elétrico':'Equipamento');
    const manufacturer=(db.catalog?.manufacturers || MANUFACTURERS).find(item=>new RegExp(`\\b${item.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}\\b`,'i').test(description)) || '';
    const powerMatch=description.match(/(\d+(?:[.,]\d+)?)\s*(cv|hp|kw)\b/i);
    return {description,type,manufacturer,power:powerMatch?`${powerMatch[1]} ${powerMatch[2].toLowerCase()}`:'',model:''};
  }
  function rememberEquipmentDescription(text) {
    const value=String(text||'').trim(); if(!value) return;
    db.catalog=db.catalog||{}; db.catalog.equipmentDescriptions=db.catalog.equipmentDescriptions||[];
    if(!db.catalog.equipmentDescriptions.some(item=>item.toLocaleLowerCase('pt-BR')===value.toLocaleLowerCase('pt-BR'))) db.catalog.equipmentDescriptions.unshift(value);
    db.catalog.equipmentDescriptions=db.catalog.equipmentDescriptions.slice(0,100);
  }
  function equipmentSuggestions() { return [...new Set([...(db.catalog?.equipmentDescriptions||[]),...db.equipment.map(e=>equipmentDescription(e))])]; }
  function partQuantity(part) { return `${part.quantity || '1'} ${part.unit || 'un'}`.trim(); }
  function partLocation(part) { return part.purchase?.location || ''; }
  function partSupplier(part) { return part.purchase?.supplier || ''; }
  function partExpectedDate(part) { return part.purchase?.expectedDate || ''; }
  function partTone(status) { return status === 'Instalada' || status === 'Recebida' || status === 'Separada' ? 'green' : status === 'Solicitada' ? 'red' : 'amber'; }
  function stageTone(stage) { return ({entrada:'gray',diagnostico:'blue',pecas:'amber',montagem:'purple',testes:'blue',relatorio:'teal',concluida:'green'})[stage] || 'gray'; }
  function badge(text, tone='gray') { return `<span class="badge badge-${tone}">${text}</span>`; }
  function addActivity(text) { db.activity.unshift({id:id('a'),at:new Date().toISOString(),text}); db.activity = db.activity.slice(0,50); }

  function toast(message, type='success') {
    const region = document.getElementById('toast-region');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    region.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }

  function navItems(portal=false) {
    return portal ? [
      ['dashboard','Dashboard','home'],['portal','Meus Equipamentos','motor'],['portal','Ordens de Serviço','clipboard'],['portal','Relatórios','chart'],['portal','Aprovações','check'],['portal','Histórico','clock'],['portal','Fotos','camera']
    ] : [
      ['dashboard','Dashboard','home'],['orders','Ordens de Serviço','clipboard'],['clients','Clientes','users'],['equipment','Equipamentos','motor'],['parts','Peças','gear'],['workshop','Oficina','tools'],['reports','Relatórios','chart'],['portal','Portal do Cliente','globe'],['settings','Configurações','gear']
    ];
  }

  function shell(content, route, portal=false) {
    const nav = navItems(portal).map(([href,label,ico],index) => `<a href="#${href}" class="${portal ? (index === 0 ? 'active' : '') : (route === href ? 'active' : '')}">${icon(ico)}<span>${label}</span></a>`).join('');
    const client = getClient('c3');
    return `<div class="app-shell ${portal ? 'portal-shell' : ''}">
      <aside class="sidebar" id="sidebar">
        <a class="brand" href="#${portal ? 'portal' : 'dashboard'}"><span class="brand-logo-wrap"><img src="./assets/ar7-logo.png" alt="AR7 Elétrica"></span><small class="brand-subtitle">${portal ? 'Portal de acompanhamento' : 'Gestão de oficina, peças e relatórios'}</small></a>
        <nav class="nav">${nav}</nav>
        <div class="sidebar-foot"><div class="machine">${portal ? '🏭' : '⚡'}</div><div><strong>${portal ? client.name : db.company.name}</strong><small>${portal ? 'Cliente ativo' : db.company.unit}</small><div style="font-size:11px;margin-top:5px"><span class="status-dot"></span>${portal ? 'Código 4587' : 'Unidade ativa'}</div></div></div>
      </aside>
      <div class="sidebar-overlay" id="sidebar-overlay" hidden></div>
      <main class="main">
        <header class="topbar"><button class="menu-btn" data-action="toggle-menu" aria-label="Abrir menu">${icon('menu',24)}</button><div></div><div class="top-actions"><button class="top-icon" aria-label="Notificações">${icon('bell')}<span>5</span></button><button class="top-icon" aria-label="Ajuda">${icon('help')}</button>${portal ? '' : `<button class="workspace">⚡ ${db.company.name} <small style="opacity:.72">v6</small> ▾</button>`}</div></header>
        ${content}
      </main>
    </div>`;
  }

  function pageHead(title, subtitle, actions='') { return `<div class="page-head"><div><h1>${title}</h1><p>${subtitle}</p></div><div class="head-actions">${actions}</div></div>`; }
  function kpi(value,label,ico,bg) { return `<div class="kpi"><div class="kpi-icon ${bg}">${icon(ico,23)}</div><div><strong>${value}</strong><span>${label}</span></div></div>`; }

  function dashboardView() {
    const counts=Object.fromEntries(STAGES.map(stage=>[stage.id,db.orders.filter(order=>order.stage===stage.id).length]));
    const pendingReports=db.orders.filter(order=>order.stage==='relatorio'||(order.stage==='concluida'&&!order.report?.sent)).length;
    const pendingParts=db.orders.flatMap(order=>order.parts||[]).filter(part=>!['Recebida','Separada','Instalada'].includes(part.status)).length;
    const overdue=db.orders.filter(order=>order.stage!=='concluida'&&order.dueDate&&order.dueDate<todayISO()).length;
    const queue=STAGES.map(stage=>{
      const orders=db.orders.filter(order=>order.stage===stage.id);
      const lineColor=stage.id==='pecas'?'#e69a13':stage.id==='concluida'?'#239257':stage.id==='montagem'?'#62556e':stage.id==='testes'?'#477a7c':'#c9202f';
      return `<section class="kanban-col"><div class="kanban-head" style="border-bottom-color:${lineColor}"><span>${safe(stage.label)}</span><span>${orders.length}</span></div><div class="kanban-list">${orders.slice(0,4).map(order=>{const eq=getEquipment(order.equipmentId),client=getClient(order.clientId);return `<article class="os-mini" tabindex="0" role="button" data-action="open-order" data-id="${order.id}"><strong>OS #${safe(order.number)}</strong><p>${safe(equipmentDescription(eq))}</p><p>${safe(client?.name||'Cliente não encontrado')}</p><div class="mini-status">${badge(formatDate(order.dueDate),order.dueDate&&order.dueDate<todayISO()&&order.stage!=='concluida'?'red':'gray')}</div></article>`;}).join('')||'<div class="empty compact"><span>Nenhuma OS</span></div>'}${orders.length>4?`<a class="queue-more" href="#orders">+ ${orders.length-4} OS</a>`:''}</div></section>`;
    }).join('');
    const clientsRank=db.clients.map(client=>({client,count:db.orders.filter(order=>order.clientId===client.id).length})).sort((a,b)=>b.count-a.count);
    return shell(`<div class="page dashboard-page">${pageHead('Olá, Administrador!','Visão da operação, prioridades e passagem entre equipes.',`<button class="btn btn-primary" data-action="new-order">${icon('plus')} Nova ordem de serviço</button>`)}<div class="grid kpi-grid">${kpi(db.orders.filter(order=>order.stage!=='concluida').length,'OS abertas','clipboard','bg-blue')}${kpi(counts.entrada,'Na recepção','users','bg-gray')}${kpi(counts.diagnostico+counts.montagem,'Na oficina','tools','bg-purple')}${kpi(counts.pecas,'Com compras','box','bg-amber')}${kpi(counts.testes,'Em qualidade','chart','bg-teal')}${kpi(pendingReports,'Para relatórios','file','bg-blue')}${kpi(counts.concluida,'Concluídas','check','bg-green')}</div><section class="card queue-card"><div class="card-head"><div><h2>Fila de trabalho por equipe</h2><p>Role horizontalmente no tablet para visualizar todas as etapas.</p></div><a href="#orders" class="table-link">Ver todas as OS</a></div><div class="card-body"><div class="kanban">${queue}</div></div></section><div class="grid dashboard-secondary"><section class="card"><div class="card-head"><h2>Produtividade mensal</h2>${badge('Últimos 6 meses','blue')}</div><div class="card-body"><div class="chart">${[32,45,38,50,62,db.orders.filter(order=>order.stage==='concluida').length*11].map((value,index)=>`<div class="bar-wrap"><strong>${value}</strong><div class="bar ${index===5?'current':''}" style="height:${Math.max(10,value)}%"></div><span>${['Mar','Abr','Mai','Jun','Jul','Ago'][index]}</span></div>`).join('')}</div></div></section><div class="stack"><section class="card"><div class="card-head"><h2>Alertas importantes</h2></div><div class="card-body alert-list"><div class="alert-item"><div class="alert-icon tone-red">${icon('alert')}</div><div><strong>${pendingParts} peças ainda pendentes</strong><p>Itens sem recebimento ou instalação.</p></div></div><div class="alert-item"><div class="alert-icon tone-amber">${icon('clock')}</div><div><strong>${overdue} ordens atrasadas</strong><p>Prazo previsto já ultrapassado.</p></div></div><div class="alert-item"><div class="alert-icon tone-blue">${icon('file')}</div><div><strong>${pendingReports} relatórios não enviados</strong><p>Serviços concluídos aguardando envio.</p></div></div></div></section><section class="card"><div class="card-head"><h2>Clientes atendidos</h2></div><div class="card-body ranking-list">${clientsRank.map((item,index)=>`<div class="ranking-item"><span>${index+1}º</span><div><strong>${safe(item.client.name)}</strong><small>${item.count} ordem(ns) de serviço</small></div></div>`).join('')}</div></section></div></div></div>`,'dashboard');
  }
  function ordersView() {
    const rows = db.orders.map(order => { const client=getClient(order.clientId),eq=getEquipment(order.equipmentId); return `<tr><td><a class="table-link" href="#order/${order.id}">#${order.number}</a></td><td>${client.name}</td><td><strong>${eq.tag}</strong><br><span style="color:var(--muted)">${equipmentDescription(eq)}</span></td><td>${badge(stageLabel(order.stage),stageTone(order.stage))}</td><td>${formatDate(order.entryDate)}</td><td>${formatDate(order.dueDate)}</td><td>${order.technician}</td><td><div class="row-actions"><button class="btn btn-light btn-sm" data-action="open-order" data-id="${order.id}">${icon('edit',14)} Abrir</button><button class="btn btn-light btn-sm" data-action="open-report" data-id="${order.id}">${icon('file',14)} Relatório</button></div></td></tr>`; }).join('');
    const content = `<div class="page">${pageHead('Ordens de Serviço','Controle completo da entrada à entrega.',`<button class="btn btn-primary" data-action="new-order">${icon('plus')} Nova OS</button>`)}
      <section class="card"><div class="card-head"><div class="filters"><div class="search"><input class="input" id="order-search" placeholder="Pesquisar por OS, cliente ou TAG"></div><select class="select" id="order-stage-filter"><option value="">Todas as etapas</option>${STAGES.map(s=>`<option value="${s.id}">${s.label}</option>`).join('')}</select></div><span>${db.orders.length} registros</span></div><div class="table-wrap"><table class="table" id="orders-table"><thead><tr><th>OS</th><th>Cliente</th><th>Equipamento</th><th>Etapa</th><th>Entrada</th><th>Prazo</th><th>Técnico</th><th>Ações</th></tr></thead><tbody>${rows}</tbody></table></div></section>
    </div>`;
    return shell(content,'orders');
  }

  function clientsView() {
    const rows = db.clients.map(client=>`<tr><td><strong>${client.name}</strong></td><td>${client.contact}</td><td>${client.email}</td><td>${db.equipment.filter(e=>e.clientId===client.id).length}</td><td>${db.orders.filter(o=>o.clientId===client.id).length}</td><td>${badge(client.active?'Ativo':'Inativo',client.active?'green':'gray')}</td></tr>`).join('');
    return shell(`<div class="page">${pageHead('Clientes','Cadastro das empresas atendidas.',`<button class="btn btn-primary" data-action="new-client">${icon('plus')} Novo cliente</button>`)}<section class="card"><div class="table-wrap"><table class="table"><thead><tr><th>Cliente</th><th>Contato</th><th>E-mail</th><th>Equipamentos</th><th>OS</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div></section></div>`,'clients');
  }

  function equipmentView() {
    const rows = db.equipment.map(eq=>{const client=getClient(eq.clientId);return `<tr><td class="description-cell"><strong>${safe(equipmentDescription(eq))}</strong><small>${safe(eq.type||'—')}${eq.manufacturer?` · ${safe(eq.manufacturer)}`:''}${eq.power?` · ${safe(eq.power)}`:''}</small></td><td>${safe(client?.name||'—')}</td><td><strong>${safe(eq.tag||'—')}</strong></td><td>${safe(eq.model||'—')}</td><td>${safe(eq.serial||'—')}</td></tr>`}).join('');
    return shell(`<div class="page">${pageHead('Equipamentos','Digite de forma natural, como “Motor WEG 3 cv”. A descrição fica salva para reutilização.',`<button class="btn btn-primary" data-action="new-equipment">${icon('plus')} Novo equipamento</button>`)}<section class="card"><div class="card-head"><div><h2>Base de equipamentos</h2><p style="margin:5px 0 0;color:var(--muted);font-size:12px">TAG e série são opcionais; o sistema gera um código interno quando necessário.</p></div>${badge(`${db.equipment.length} cadastrados`,'red')}</div><div class="table-wrap"><table class="table"><thead><tr><th>Descrição do equipamento</th><th>Cliente</th><th>TAG / código interno</th><th>Modelo</th><th>Nº de série</th></tr></thead><tbody>${rows}</tbody></table></div></section></div>`,'equipment');
  }

  function partsView() {
    const parts = db.orders.flatMap(order => order.parts.map(part => ({...part,order})));
    const rows = parts.map(item=>{const eq=getEquipment(item.order.equipmentId),commercial=item.purchase||{};return `<tr><td>${item.photo?`<img class="part-photo" src="${safe(item.photo)}" alt="Foto da peça">`:''}</td><td><div class="part-technical"><strong>${item.name}</strong><small>Código: ${item.code||'não informado'}</small><small>Medidas: ${item.dimensions||'não informadas'}</small><small>Aplicação: ${item.position||'não informada'}</small></div></td><td><a class="table-link" href="#order/${item.order.id}">OS #${item.order.number}</a><br>${eq.tag} · ${equipmentDescription(eq)}</td><td>${partQuantity(item)}</td><td>${badge(item.status,partTone(item.status))}</td><td><div class="commercial-summary"><strong>${commercial.supplier||'Compras ainda não preencheu'}</strong><span>${commercial.expectedDate?`Previsão: ${formatDate(commercial.expectedDate)}`:'Sem previsão'}</span><span>${commercial.quote?`Cotação/Pedido: ${commercial.quote}`:''}</span></div></td><td>${commercial.location||'—'}</td><td><div class="row-actions"><button class="btn btn-light btn-sm" data-action="edit-purchase" data-order="${item.order.id}" data-part="${item.id}">${icon('edit',14)} Dados da compra</button><button class="btn btn-primary btn-sm" data-action="advance-part" data-order="${item.order.id}" data-part="${item.id}" ${item.status==='Instalada'?'disabled':''}>Avançar</button></div></td></tr>`}).join('');
    const pending = parts.filter(p=>!['Recebida','Separada','Instalada'].includes(p.status)).length;
    return shell(`<div class="page">${pageHead('Peças e Compras','A oficina informa somente o necessário tecnicamente. Compras completa fornecedor, preço e previsão depois.',`<button class="btn btn-primary" data-action="new-part-global">${icon('plus')} Nova solicitação técnica</button>`)}<div class="grid kpi-grid" style="grid-template-columns:repeat(4,1fr)">${kpi(parts.length,'Itens rastreados','gear','bg-blue')}${kpi(parts.filter(p=>p.status==='Solicitada').length,'Aguardando Compras','clipboard','bg-red')}${kpi(parts.filter(p=>p.status==='Comprada').length,'Comprados','box','bg-amber')}${kpi(pending,'Pendentes de recebimento','clock','bg-purple')}</div><section class="card"><div class="card-head"><div><h2>Fila de materiais</h2><p style="margin:5px 0 0;color:var(--muted);font-size:12px">Código e medidas permanecem em campos separados para evitar pedidos errados.</p></div></div><div class="table-wrap"><table class="table"><thead><tr><th>Foto</th><th>Especificação técnica</th><th>OS / Equipamento</th><th>Qtd.</th><th>Status</th><th>Dados de Compras</th><th>Local</th><th>Ações</th></tr></thead><tbody>${rows||'<tr><td colspan="8"><div class="empty">Nenhuma peça cadastrada</div></td></tr>'}</tbody></table></div></section></div>`,'parts');
  }

  function workshopView() {
    const active = db.orders.filter(o=>o.stage!=='concluida');
    const cards = active.map(order=>{const eq=getEquipment(order.equipmentId),client=getClient(order.clientId),pending=order.parts.filter(p=>!['Recebida','Separada','Instalada'].includes(p.status)).length;return `<article class="card"><div class="card-body"><div style="display:flex;justify-content:space-between;gap:10px"><div><strong>OS #${order.number} · ${eq.tag}</strong><p style="color:var(--muted);font-size:12px;margin:5px 0">${client.name} · ${equipmentDescription(eq)}</p></div>${badge(stageLabel(order.stage),stageTone(order.stage))}</div><div style="margin:15px 0;display:flex;gap:8px;flex-wrap:wrap">${badge(`${order.photos.before.length+order.photos.during.length+order.photos.after.length} fotos`,'blue')}${badge(`${pending} peças pendentes`,pending?'amber':'green')}${badge(formatDate(order.dueDate),order.dueDate<todayISO()?'red':'gray')}</div><a class="btn btn-primary" href="#order/${order.id}">Abrir execução ${icon('arrow',16)}</a></div></article>`}).join('');
    return shell(`<div class="page">${pageHead('Oficina','Execução das etapas, peças, fotos e evidências.')}<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))">${cards}</div></div>`,'workshop');
  }

  function stageRequirements(order) {
    const availableParts = order.parts.filter(part=>['Recebida','Separada','Instalada'].includes(part.status)).length;
    const requirements = {
      entrada: [
        {label:'Defeito informado e prazo preenchidos',ok:Boolean(order.defect&&order.dueDate)},
        {label:'Pelo menos uma foto do equipamento no recebimento',ok:order.photos.before.length>0}
      ],
      diagnostico: [
        {label:'Diagnóstico técnico registrado nas observações',ok:Boolean(order.notes&&order.notes.trim().length>=10)},
        {label:'Evidência fotográfica da desmontagem ou diagnóstico',ok:order.photos.during.length>0},
        {label:'Informar as peças necessárias ou marcar “não precisa de peças”',ok:order.noPartsRequired||order.parts.length>0}
      ],
      pecas: [
        {label:'Definir se há peças necessárias',ok:order.noPartsRequired||order.parts.length>0},
        {label:order.noPartsRequired?'Serviço marcado sem necessidade de peças':'Todas as peças recebidas e identificadas',ok:order.noPartsRequired||(order.parts.length>0&&availableParts===order.parts.length)}
      ],
      montagem: [
        {label:'Registro técnico da montagem salvo',ok:Boolean(order.notes&&order.notes.trim().length>=10)},
        {label:'Foto durante a montagem adicionada',ok:order.photos.during.length>0}
      ],
      testes: [
        {label:'Pelo menos uma medição ou teste registrado',ok:order.measurements.length>0},
        {label:'Foto final do equipamento adicionada',ok:order.photos.after.length>0}
      ],
      relatorio: [
        {label:'Dados obrigatórios do relatório completos',ok:reportReady(order)},
        {label:'Aprovação do supervisor',ok:Boolean(order.report.approved)},
        {label:'Relatório enviado ao cliente',ok:Boolean(order.report.sent)}
      ],
      concluida: [{label:'Processo encerrado e disponível ao cliente',ok:true}]
    };
    return requirements[order.stage]||[];
  }

  function handoffButtonLabel(stage) {
    return ({
      entrada:'Concluir recebimento e enviar à Oficina',
      diagnostico:'Concluir diagnóstico e enviar para Compras',
      pecas:'Liberar materiais e enviar para Montagem',
      montagem:'Concluir montagem e enviar para Qualidade',
      testes:'Concluir testes e enviar para Relatórios'
    })[stage]||'Concluir etapa';
  }

  function orderDetailView(orderId) {
    const order=getOrder(orderId); if(!order) return notFoundView();
    const client=getClient(order.clientId),eq=getEquipment(order.equipmentId),idx=stageIndex(order.stage),progress=Math.round((idx/(STAGES.length-1))*100),current=STAGES[idx],next=STAGES[Math.min(idx+1,STAGES.length-1)],requirements=stageRequirements(order),ready=requirements.every(item=>item.ok);
    const stairs = STAGES.map((stage,i)=>`<div class="workflow-step ${i<idx?'done':''} ${i===idx?'current':''} ${i>idx?'locked':''}" style="--step:${i}"><div class="workflow-step-top"><span>${i<idx?icon('check',15):i+1}</span><small>${stage.team}</small></div><strong>${stage.label}</strong><p>${stage.short}</p></div>`).join('');
    const parts = order.parts.map(part=>`<tr><td>${part.photo?`<img class="part-photo" src="${safe(part.photo)}" alt="Foto da peça">`:''}</td><td><strong>${part.name}</strong><br><span style="color:var(--muted)">${part.position||'Aplicação não informada'}</span></td><td>${part.code||'—'}</td><td>${part.dimensions||'—'}</td><td>${partQuantity(part)}</td><td>${badge(part.status,partTone(part.status))}</td><td><div class="row-actions"><button class="btn btn-light btn-sm" data-action="edit-purchase" data-order="${order.id}" data-part="${part.id}">Compra</button><button class="btn btn-light btn-sm" data-action="advance-part" data-order="${order.id}" data-part="${part.id}" ${part.status==='Instalada'?'disabled':''}>Avançar</button></div></td></tr>`).join('');
    const photos = (group,label) => `<div><div class="photo-head"><strong>${label}</strong><label class="btn btn-light btn-sm upload-tile">${icon('camera',15)} Adicionar<input type="file" accept="image/*" multiple data-action="photo-upload" data-order="${order.id}" data-group="${group}"></label></div><div class="photo-grid">${order.photos[group].map((src,i)=>`<div class="photo-tile"><img src="${src}" alt="Foto ${label}"><button data-action="delete-photo" data-order="${order.id}" data-group="${group}" data-index="${i}" aria-label="Excluir foto">×</button></div>`).join('') || `<label class="photo-tile upload-tile">${icon('camera',28)}<br>Adicionar foto<input type="file" accept="image/*" multiple data-action="photo-upload" data-order="${order.id}" data-group="${group}"></label>`}</div></div>`;
    const handoffs=(order.handoffs||[]).slice().reverse().map(item=>`<div class="handoff-item"><span>${icon('arrow',14)}</span><div><strong>${item.fromTeam} → ${item.toTeam}</strong><small>${formatDateTime(item.at)}</small></div></div>`).join('');
    const stageActions = ['diagnostico','pecas'].includes(order.stage)?`<button class="btn btn-light" data-action="toggle-no-parts" data-id="${order.id}">${order.noPartsRequired?'Desmarcar “sem peças”':'Não precisa de peças'}</button><button class="btn btn-light" data-action="add-part" data-id="${order.id}">${icon('plus',15)} Informar peça necessária</button>`:order.stage==='testes'?`<button class="btn btn-light" data-action="add-measurement" data-id="${order.id}">${icon('plus',15)} Registrar medição</button>`:'';
    const primaryAction = order.stage==='relatorio'?`<button class="btn btn-primary" data-action="open-report" data-id="${order.id}">${icon('file')} Abrir relatório e finalizar</button>`:order.stage==='concluida'?`<button class="btn btn-success" disabled>${icon('check')} Processo concluído</button>`:`<button class="btn btn-primary" data-action="advance-stage" data-id="${order.id}" ${ready?'':'disabled'}>${handoffButtonLabel(order.stage)} ${icon('arrow',16)}</button>`;
    const content = `<div class="page">
      ${pageHead(`OS ${order.number}`,`${client.name} · ${eq.tag} · Criada automaticamente`,`<button class="btn btn-light" data-action="open-report" data-id="${order.id}">${icon('file')} Ver relatório</button>`)}
      <section class="workflow-card"><div class="workflow-title"><div><span>Fluxo guiado</span><h2>Cada equipe conclui sua parte e entrega para a próxima</h2></div>${badge(`${progress}% concluído`,progress===100?'green':'blue')}</div><div class="workflow-stair">${stairs}</div></section>
      <section class="current-task"><div class="current-team"><small>AGORA COM</small><strong>${current.team}</strong><span>${current.label}</span></div><div class="task-body"><div><small>O que falta para concluir esta etapa</small><div class="requirement-list">${requirements.map(item=>`<div class="requirement ${item.ok?'ok':'pending'}"><span>${icon(item.ok?'check':'clock',16)}</span><strong>${item.label}</strong></div>`).join('')}</div></div><div class="next-team"><small>PRÓXIMA EQUIPE</small><strong>${order.stage==='concluida'?'Processo encerrado':next.team}</strong><span>${order.stage==='concluida'?'Cliente já pode acompanhar':next.label}</span></div></div><div class="task-actions">${stageActions}<button class="btn btn-light" data-action="save-notes" data-id="${order.id}">${icon('save')} Salvar rascunho</button>${primaryAction}</div></section>
      <section class="card" style="margin-bottom:16px"><div class="detail-hero"><div class="detail-field"><label>Cliente / TAG</label><strong>${client.name} · ${eq.tag}</strong></div><div class="detail-field"><label>Equipamento</label><strong>${equipmentDescription(eq)}</strong></div><div class="detail-field"><label>Entrada / Prazo</label><strong>${formatDate(order.entryDate)}<br>${formatDate(order.dueDate)}</strong></div><div class="detail-field"><label>Defeito informado</label><strong>${order.defect}</strong></div></div></section>
      <div class="grid detail-layout">
        <div class="stack">
          <section class="card"><div class="card-head"><h2>Registro técnico da etapa</h2><span class="autosave-note">Salve antes de encaminhar</span></div><div class="card-body"><textarea class="textarea" id="order-notes" placeholder="Registre diagnóstico, serviços executados, condições e observações...">${order.notes||''}</textarea><div class="reception-summary"><div><span>Recebido por</span><strong>${order.reception?.receivedBy||'Não informado'}</strong></div><div><span>Condição inicial</span><strong>${order.reception?.condition||'Não informada'}</strong></div><div><span>Acessórios</span><strong>${order.reception?.accessories||'Nenhum informado'}</strong></div></div></div></section>
          <section class="card"><div class="card-head"><h2>Peças vinculadas à OS</h2><div>${order.noPartsRequired?badge('Sem peças necessárias','green'):''}</div></div><div class="table-wrap"><table class="table"><thead><tr><th>Foto</th><th>Peça / aplicação</th><th>Código</th><th>Medidas</th><th>Qtd.</th><th>Status</th><th>Ações</th></tr></thead><tbody>${parts||'<tr><td colspan="7"><div class="empty"><strong>Nenhuma peça vinculada</strong>Durante o diagnóstico, informe as peças necessárias ou marque que não serão utilizadas.</div></td></tr>'}</tbody></table></div></section>
          <section class="card"><div class="card-head"><h2>Medições e testes</h2><button class="btn btn-light btn-sm" data-action="add-measurement" data-id="${order.id}">${icon('plus',15)} Adicionar</button></div><div class="table-wrap"><table class="table"><thead><tr><th>Parâmetro</th><th>Unidade</th><th>Antes</th><th>Depois</th><th>Limite</th><th>Status</th></tr></thead><tbody>${order.measurements.map(m=>`<tr><td><strong>${m.name}</strong></td><td>${m.unit}</td><td>${m.before}</td><td>${m.after}</td><td>${m.limit}</td></tr>`).join('')||'<tr><td colspan="5"><div class="empty">Nenhuma medição registrada.</div></td></tr>'}</tbody></table></div></section>
        </div>
        <div class="stack">
          <section class="card"><div class="card-head"><h2>Fotos e evidências</h2></div><div class="card-body stack">${photos('before','1. Recebimento')}${photos('during','2. Durante o serviço')}${photos('after','3. Equipamento finalizado')}</div></section>
          <section class="card"><div class="card-head"><h2>Passagens entre equipes</h2></div><div class="card-body handoff-list">${handoffs||'<div class="empty">A primeira passagem será registrada ao concluir esta etapa.</div>'}</div></section>
        </div>
      </div>
    </div>`;
    return shell(content,'workshop');
  }

  function reportChecklist(order) {
    const photos = order.photos.before.length+order.photos.during.length+order.photos.after.length;
    return [
      {label:'Resumo do serviço',ok:Boolean(order.notes),detail:order.notes?'Preenchido':'Falta conclusão técnica'},
      {label:'Medições',ok:order.measurements.length>0,detail:`${order.measurements.length} registradas`},
      {label:'Peças trocadas',ok:order.noPartsRequired||order.parts.length>0,detail:order.noPartsRequired?'Sem peças necessárias':`${order.parts.length} itens`},
      {label:'Fotos e evidências',ok:photos>0,detail:`${photos} fotos`},
      {label:'Destinatário do e-mail',ok:Boolean(order.report.recipient),detail:order.report.recipient||'Não informado'}
    ];
  }
  function reportReady(order) { return reportChecklist(order).every(item=>item.ok); }

  function reportsView(orderId) {
    const order = getOrder(orderId) || db.orders.find(o=>o.stage==='relatorio') || db.orders.find(o=>o.stage==='concluida') || db.orders[0];
    return reportDetailView(order.id);
  }

  function reportDetailView(orderId) {
    const order=getOrder(orderId); if(!order) return notFoundView();
    const client=getClient(order.clientId),eq=getEquipment(order.equipmentId),checks=reportChecklist(order),ready=reportReady(order),photos=[...order.photos.before,...order.photos.during,...order.photos.after];
    const sideChecks = checks.map((c,i)=>`<div class="check-section"><div class="check-title"><strong>${c.ok?'<span class="check-ok">✓</span>':'<span style="color:var(--red-700)">!</span>'} ${i+1}. ${c.label}</strong><button class="btn btn-light btn-sm" data-action="open-order" data-id="${order.id}">Editar</button></div><p>${c.detail}</p></div>`).join('');
    const measurementRows = order.measurements.map(m=>`<tr><td>${m.name}</td><td>${m.unit}</td><td>${m.before}</td><td>${m.after}</td><td>${m.limit}</td><td style="color:#168a50;font-weight:800">OK</td></tr>`).join('');
    const content = `<div class="page">
      ${pageHead('Geração de Relatórios','Revise as informações, gere o PDF e envie ao cliente.',`<button class="btn btn-light" data-action="print-report">${icon('download')} Gerar PDF</button><button class="btn btn-success" data-action="approve-report" data-id="${order.id}" ${order.report.approved?'disabled':''}>${icon('check')} ${order.report.approved?'Aprovado':'Aprovar'}</button><button class="btn btn-primary" data-action="send-report" data-id="${order.id}">${icon('send')} Enviar ao cliente</button>`)}
      <div class="grid report-layout">
        <section class="card report-checklist"><div class="card-head"><h2>Dados do relatório</h2></div>${sideChecks}<div class="check-section"><div class="check-title"><strong>6. Aprovação do supervisor</strong>${badge(order.report.approved?'Aprovado':'Pendente',order.report.approved?'green':'amber')}</div><p>${order.supervisor}</p></div><div class="check-section"><label style="font-size:12px;font-weight:800">Agendar envio</label><input class="input" type="datetime-local" id="schedule-at" value="${order.report.scheduledAt||''}"><button class="btn btn-light" data-action="schedule-report" data-id="${order.id}" style="width:100%;margin-top:8px">${icon('clock')} Agendar</button></div></section>
        <section class="pdf-shell"><div class="pdf-toolbar"><span>${icon('menu',17)}</span><span>Relatorio_OS_${order.number}.pdf</span><span style="margin-left:auto">1 / 6 &nbsp; · &nbsp; 100%</span></div><article class="pdf-page" id="printable-report"><div class="pdf-header"><div class="pdf-logo"><img class="brand-report-logo" src="./assets/ar7-logo.png" alt="AR7 Elétrica"></div><div class="pdf-title"><strong>RELATÓRIO TÉCNICO</strong><span style="color:var(--blue-700);font-weight:800">OS #${order.number}</span></div></div><div class="pdf-section"><div class="pdf-info"><div><strong>Cliente</strong><br>${client.name}<br><br><strong>Equipamento</strong><br>${equipmentDescription(eq)}<br><br><strong>TAG / Série</strong><br>${eq.tag} · ${eq.serial}</div><div class="pdf-photo">⚙️</div></div></div><div class="pdf-section"><h3>RESUMO DO SERVIÇO</h3><p style="font-size:11px;line-height:1.7">${order.notes||'Conclusão técnica ainda não preenchida.'}</p></div><div class="pdf-section"><h3>MEDIÇÕES REALIZADAS</h3><table class="pdf-table"><thead><tr><th>Parâmetro</th><th>Unidade</th><th>Antes</th><th>Depois</th><th>Limite</th><th>Status</th></tr></thead><tbody>${measurementRows||'<tr><td colspan="6">Nenhuma medição registrada.</td></tr>'}</tbody></table></div><div class="pdf-section"><h3>PEÇAS SUBSTITUÍDAS</h3><table class="pdf-table"><thead><tr><th>Peça</th><th>Código</th><th>Medidas</th><th>Quantidade</th><th>Status</th></tr></thead><tbody>${order.parts.map(p=>`<tr><td>${p.name}</td><td>${p.code||'—'}</td><td>${p.dimensions||'—'}</td><td>${partQuantity(p)}</td><td>${p.status}</td></tr>`).join('')||'<tr><td colspan="5">Nenhuma peça registrada.</td></tr>'}</tbody></table></div><div class="pdf-section"><h3>FOTOS DO SERVIÇO</h3><div class="pdf-thumbs">${photos.slice(0,4).map(src=>`<div class="pdf-thumb"><img src="${src}" alt="Foto do serviço" style="width:100%;height:100%;object-fit:cover;border-radius:6px"></div>`).join('')||'<div class="pdf-thumb">Sem fotos</div>'}</div></div><div style="display:flex;justify-content:space-between;margin-top:30px;font-size:9px;color:#64748b"><span>AR7 Elétrica · Gestão de oficina, peças e relatórios</span><span>Página 1 de 6</span></div></article></section>
        <aside class="stack report-side"><section class="card"><div class="card-head"><h2>Status do relatório</h2></div><div class="card-body"><div style="display:flex;gap:12px;align-items:center"><div class="alert-icon ${ready?'tone-blue':'tone-red'}">${icon(ready?'check':'alert')}</div><div><strong>${ready?'Pronto para aprovação':'Existem pendências'}</strong><p style="font-size:11px;color:var(--muted)">${ready?'Todos os campos obrigatórios foram preenchidos.':'Corrija os itens destacados antes do envio.'}</p></div></div></div></section><section class="card"><div class="card-head"><h2>Checklist de qualidade</h2></div><div class="card-body alert-list">${checks.map(c=>`<div class="alert-item"><div class="alert-icon ${c.ok?'tone-blue':'tone-red'}">${icon(c.ok?'check':'alert',16)}</div><div><strong>${c.label}</strong><p>${c.detail}</p></div></div>`).join('')}</div></section><section class="card"><div class="card-head"><h2>Histórico de envio</h2></div><div class="card-body">${order.report.sent?`<p><strong>Enviado</strong><br><span style="color:var(--muted);font-size:12px">${formatDateTime(order.report.sentAt)}</span></p>`:order.report.scheduledAt?`<p><strong>Agendado</strong><br><span style="color:var(--muted);font-size:12px">${formatDateTime(order.report.scheduledAt)}</span></p>`:'<div class="empty">Nenhum envio registrado.</div>'}</div></section></aside>
      </div>
    </div>`;
    return shell(content,'reports');
  }

  function portalView() {
    const client=getClient('c3'); const orders=db.orders.filter(o=>o.clientId===client.id); const equipment=db.equipment.filter(e=>e.clientId===client.id);
    const awaiting=orders.filter(o=>o.stage==='pecas').length,ready=orders.filter(o=>o.stage==='concluida').length,reports=orders.filter(o=>o.report.sent).length;
    const rows=equipment.map(eq=>{const order=orders.find(o=>o.equipmentId===eq.id);return `<tr><td><strong class="table-link">${eq.tag}</strong></td><td>${eq.type}</td><td>${order?badge(stageLabel(order.stage),stageTone(order.stage)):badge('Sem OS','gray')}</td><td>${order?stageLabel(order.stage):'—'}</td><td>${order?formatDate(order.dueDate):'—'}</td><td>${order?`<button class="btn btn-light btn-sm" data-action="portal-report" data-id="${order.id}">${icon('file',14)} Ver relatório</button>`:'—'}</td></tr>`}).join('');
    const approvals=orders.filter(o=>o.stage==='pecas').map(o=>{const eq=getEquipment(o.equipmentId);const value=o.parts.length*1590;return `<div class="alert-item"><div class="alert-icon tone-amber">${icon('clock')}</div><div style="flex:1"><strong>OS #${o.number} · ${eq.tag}</strong><p>Orçamento de peças e mão de obra</p></div><strong>R$ ${value.toLocaleString('pt-BR')},00</strong><button class="btn btn-light btn-sm" data-action="portal-approve" data-id="${o.id}">Aprovar</button></div>`}).join('');
    const content=`<div class="page">${pageHead('Portal do Cliente','Acompanhe o status dos seus equipamentos e serviços.')}<div class="grid kpi-grid" style="grid-template-columns:repeat(4,1fr)">${kpi(orders.filter(o=>o.stage!=='concluida').length,'Em manutenção','tools','bg-blue')}${kpi(awaiting,'Aguardando aprovação','clock','bg-amber')}${kpi(ready,'Prontos para retirada','check','bg-green')}${kpi(reports,'Relatórios disponíveis','file','bg-purple')}</div><div class="grid portal-layout"><div class="stack"><section class="card"><div class="card-head"><h2>Seus equipamentos</h2></div><div class="table-wrap"><table class="table"><thead><tr><th>TAG</th><th>Tipo</th><th>Status</th><th>Etapa atual</th><th>Previsão</th><th>Ação</th></tr></thead><tbody>${rows}</tbody></table></div></section><div class="grid" style="grid-template-columns:1fr 1fr"><section class="card"><div class="card-head"><h2>Relatórios recentes</h2></div><div class="card-body alert-list">${orders.filter(o=>o.report.sent).map(o=>`<div class="alert-item"><div class="alert-icon tone-blue">${icon('file')}</div><div style="flex:1"><strong>OS #${o.number}</strong><p>${formatDateTime(o.report.sentAt)}</p></div><button class="btn btn-light btn-sm" data-action="portal-report" data-id="${o.id}">${icon('download',14)}</button></div>`).join('')||'<div class="empty">Nenhum relatório disponível.</div>'}</div></section><section class="card"><div class="card-head"><h2>Histórico por TAG</h2></div><div class="card-body timeline">${orders.slice(0,4).map(o=>`<div class="timeline-item"><strong>${getEquipment(o.equipmentId).tag} · ${stageLabel(o.stage)}</strong><p>${formatDate(o.entryDate)} · OS #${o.number}</p><p>${o.notes||o.defect}</p></div>`).join('')}</div></section></div></div><aside class="stack"><section class="card"><div class="card-head"><h2>Aprovações pendentes</h2></div><div class="card-body alert-list">${approvals||'<div class="empty">Nenhuma aprovação pendente.</div>'}</div></section><section class="card"><div class="card-head"><h2>Rastreabilidade e transparência</h2></div><div class="card-body"><p style="color:var(--muted);font-size:12px">Acompanhe cada etapa com fotos, peças trocadas, testes e relatórios completos.</p><div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap"><div class="qr">${Array.from({length:121},(_,i)=>`<i class="${((i*7+i*i)%5===0||i<3||i>117)?'off':''}"></i>`).join('')}</div><div><p>✓ Fotos do antes e depois</p><p>✓ Peças substituídas</p><p>✓ Testes e medições</p><p>✓ Relatórios completos</p></div></div></div></section></aside></div></div>`;
    return shell(content,'portal',true);
  }

  function settingsView() {
    return shell(`<div class="page">${pageHead('Configurações','Dados da unidade, backup e recuperação.')}<div class="grid settings-grid-v2022"><section class="card"><div class="card-head"><h2>Dados da oficina</h2></div><div class="card-body form-grid"><div class="form-group span-2"><label for="company-name">Nome</label><input class="input" id="company-name" value="${safe(db.company.name)}" required></div><div class="form-group"><label for="company-unit">Unidade</label><input class="input" id="company-unit" value="${safe(db.company.unit)}"></div><div class="form-group"><label for="company-email">E-mail de relatórios</label><input class="input" type="email" id="company-email" value="${safe(db.company.email)}" required></div><div class="span-2"><button class="btn btn-primary" data-action="save-settings">${icon('save')} Salvar dados</button></div></div></section><section class="card"><div class="card-head"><h2>Backup dos dados</h2></div><div class="card-body stack"><p style="color:var(--muted);font-size:13px">Exporte todos os clientes, equipamentos, OS, peças e relatórios em JSON.</p><button class="btn btn-light" data-action="export-data">${icon('download')} Exportar backup</button><label class="btn btn-light">${icon('file')} Importar backup<input type="file" accept="application/json" id="import-file" hidden></label><div class="settings-danger-note-v2022"><strong>Atenção</strong><span>Esta ação substitui os dados locais atuais pelos dados de demonstração. Use somente para testes.</span></div><button class="btn btn-danger" data-action="reset-data">${icon('trash')} Restaurar dados de demonstração</button></div></section></div></div>`,'settings');
  }

  function notFoundView() { return shell(`<div class="page"><div class="empty"><strong>Página não encontrada</strong><a class="btn btn-primary" href="#dashboard">Voltar ao dashboard</a></div></div>`,''); }

  function parseRoute() {
    const raw=(location.hash||'#dashboard').slice(1); const [route,param]=raw.split('/'); return {route,param};
  }
  function render() {
    const {route,param}=parseRoute();
    const views={dashboard:dashboardView,orders:ordersView,clients:clientsView,equipment:equipmentView,parts:partsView,workshop:workshopView,reports:()=>reportsView(param),portal:portalView,settings:settingsView,order:()=>orderDetailView(param)};
    document.getElementById('app').innerHTML=(views[route]||notFoundView)();
    window.scrollTo(0,0);
  }

  function openModal(title, body, footer='') {
    closeModal();
    const wrap=document.createElement('div');
    wrap.className='modal-backdrop';
    wrap.id='modal-backdrop';
    wrap.innerHTML=`<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-head"><h2 id="modal-title">${safe(title)}</h2><button class="close-btn" data-action="close-modal" aria-label="Fechar">×</button></div><div class="modal-body">${body}</div><div class="modal-foot">${footer||'<button class="btn btn-light" data-action="close-modal">Fechar</button>'}</div></div>`;
    wrap.querySelectorAll('button:not([type])').forEach(button=>button.type='button');
    wrap.querySelectorAll('.form-group').forEach(group=>{
      const label=group.querySelector('label'),control=group.querySelector('input:not([type="hidden"]),select,textarea');
      if(label&&control&&!control.getAttribute('aria-label')&&!control.getAttribute('aria-labelledby'))control.setAttribute('aria-label',label.textContent.replace(/\s+/g,' ').trim().replace(/\s*\*$/,''));
    });
    document.body.appendChild(wrap);
    document.body.classList.add('modal-open');
    currentModal=wrap;
    requestAnimationFrame(()=>{
      const first=wrap.querySelector('input:not([type="hidden"]),select,textarea,button:not(.close-btn)');
      first?.focus({preventScroll:true});
    });
  }
  function closeModal(){
    currentModal?.remove();
    currentModal=null;
    document.body.classList.remove('modal-open');
  }
  function wizardSteps(activeStep) {
    const labels = ['Cliente','Equipamento','Recebimento','Revisão'];
    return `<div class="wizard-steps">${labels.map((label,index)=>{const step=index+1;return `<div class="wizard-step ${step<activeStep?'done':''} ${step===activeStep?'active':''}"><span>${step<activeStep?icon('check',15):step}</span><strong>${label}</strong></div>`}).join('')}</div>`;
  }

  function newOrderModal(step=1, reset=false) {
    if (reset || !newOrderDraft) newOrderDraft = {clientId:'',equipmentText:'',equipmentTag:'',equipmentSerial:'',entryDate:todayISO(),dueDate:'',receivedBy:'',technician:'A definir',defect:'',condition:'',accessories:''};
    const number = nextOrderNumber();
    const client = getClient(newOrderDraft.clientId);
    const clientEquipment = db.equipment.filter(e=>e.clientId===newOrderDraft.clientId);
    const suggestions = [...new Set([
      ...clientEquipment.map(e=>equipmentDescription(e)),
      ...(db.catalog?.equipmentDescriptions||[]),
      ...equipmentSuggestions()
    ])];
    let content = '';
    if (step === 1) content = `<form id="new-order-wizard" data-step="1" class="form-grid"><div class="auto-number span-2"><small>Número gerado automaticamente</small><strong>OS ${number}</strong><span>Você não digita nem controla a sequência.</span></div><div class="form-group span-2"><label>Cliente *</label><select class="select" name="clientId" required><option value="">Selecione o cliente</option>${db.clients.filter(c=>c.active).map(c=>`<option value="${c.id}" ${newOrderDraft.clientId===c.id?'selected':''}>${c.name}</option>`).join('')}</select><small>Depois disso, basta digitar o equipamento como a equipe conhece.</small></div><div class="form-group"><label>Data de entrada *</label><input class="input" type="date" name="entryDate" value="${safe(newOrderDraft.entryDate)}" required></div><div class="form-group"><label>Recebido por</label><input class="input" name="receivedBy" value="${newOrderDraft.receivedBy}" placeholder="Nome de quem recebeu"></div></form>`;
    if (step === 2) content = `<form id="new-order-wizard" data-step="2" class="form-grid"><div class="selection-summary span-2"><span>Cliente</span><strong>${client?.name||'Não selecionado'}</strong></div><div class="smart-entry span-2"><div class="smart-entry-title"><span>${icon('edit',19)}</span><div><strong>Digite o equipamento</strong><small>Ex.: Motor WEG 3 cv. Se já existir para este cliente, o sistema reutiliza. Se for novo, salva automaticamente.</small></div></div><div class="form-group"><label>Equipamento *</label><input class="input equipment-main-input" name="equipmentText" list="equipment-description-list" value="${newOrderDraft.equipmentText}" required autocomplete="off" placeholder="Ex.: Motor WEG 3 cv"><datalist id="equipment-description-list">${suggestions.map(item=>`<option value="${item}"></option>`).join('')}</datalist></div><div class="equipment-entry-hint">${icon('check',16)} <span><strong>Campo livre com memória:</strong> você digita normalmente e as descrições usadas ficam disponíveis como sugestão nas próximas OS.</span></div></div><details class="optional-details span-2" ${newOrderDraft.equipmentTag||newOrderDraft.equipmentSerial?'open':''}><summary>TAG e número de série — opcionais</summary><div class="form-grid optional-details-body"><div class="form-group"><label>TAG do cliente</label><input class="input" name="equipmentTag" value="${newOrderDraft.equipmentTag}" placeholder="Ex.: MTR-204"></div><div class="form-group"><label>Número de série</label><input class="input" name="equipmentSerial" value="${newOrderDraft.equipmentSerial}" placeholder="Preencha somente se estiver disponível"></div></div></details></form>`;
    if (step === 3) content = `<form id="new-order-wizard" data-step="3" class="form-grid"><div class="form-group"><label>Prazo previsto *</label><input class="input" type="date" name="dueDate" value="${newOrderDraft.dueDate}" min="${newOrderDraft.entryDate}" required></div><div class="form-group"><label>Técnico inicial</label><input class="input" name="technician" value="${newOrderDraft.technician}" placeholder="Pode ser definido depois"></div><div class="form-group span-2"><label>Defeito informado pelo cliente *</label><textarea class="textarea" name="defect" required placeholder="Descreva exatamente o que o cliente relatou">${newOrderDraft.defect}</textarea></div><div class="form-group span-2"><label>Condição no recebimento</label><textarea class="textarea" name="condition" placeholder="Ex.: carcaça suja, eixo travado, caixa de ligação danificada">${newOrderDraft.condition}</textarea></div><div class="form-group span-2"><label>Acessórios recebidos</label><input class="input" name="accessories" value="${newOrderDraft.accessories}" placeholder="Ex.: acoplamento, base, tampa, cabos"></div></form>`;
    if (step === 4) { content = `<div class="wizard-review"><div class="review-title">${icon('check',22)} Confira antes de gerar a OS</div><div class="review-grid"><div><span>Número automático</span><strong>OS ${number}</strong></div><div><span>Cliente</span><strong>${client?.name||'—'}</strong></div><div><span>Equipamento digitado</span><strong>${newOrderDraft.equipmentText||'—'}</strong><small>Será reutilizado da base ou salvo automaticamente.</small></div><div><span>TAG / Série</span><strong>${newOrderDraft.equipmentTag||'Não informado'} · ${newOrderDraft.equipmentSerial||'Não informado'}</strong></div><div><span>Entrada / Prazo</span><strong>${formatDate(newOrderDraft.entryDate)} · ${formatDate(newOrderDraft.dueDate)}</strong></div><div><span>Recebido por</span><strong>${newOrderDraft.receivedBy||'Não informado'}</strong></div><div class="wide"><span>Defeito informado</span><strong>${newOrderDraft.defect}</strong></div></div><div class="handoff-preview"><span>Após gerar</span><strong>A OS ficará disponível na fila da Recepção</strong><small>A equipe adiciona as fotos iniciais e conclui sua etapa para liberar a Oficina.</small></div></div>`; }
    const footer = `<button class="btn btn-light" data-action="close-modal">Cancelar</button>${step>1?`<button class="btn btn-light" data-action="wizard-back" data-step="${step}">Voltar</button>`:''}${step<4?`<button class="btn btn-primary" data-action="wizard-next" data-step="${step}">Próximo passo ${icon('arrow',16)}</button>`:`<button class="btn btn-primary" data-action="submit-new-order">${icon('save')} Gerar OS automaticamente</button>`}`;
    openModal(`Nova ordem de serviço`,`${wizardSteps(step)}${content}`,footer);
  }

  function collectWizardStep(step) {
    const form=document.getElementById('new-order-wizard');
    if (!form || !form.reportValidity()) return false;
    const data=Object.fromEntries(new FormData(form));
    if(step===2 && !String(data.equipmentText||'').trim()){
      toast('Digite o equipamento, por exemplo “Motor WEG 3 cv”.','error');
      return false;
    }
    Object.assign(newOrderDraft,data);
    if (step===1) {
      newOrderDraft.equipmentText='';
      newOrderDraft.equipmentTag='';
      newOrderDraft.equipmentSerial='';
    }
    return true;
  }

  function addPartModal(orderId='') {
    const activeOrders=db.orders.filter(o=>o.stage!=='concluida');
    const orderField=orderId
      ? `<input type="hidden" name="orderId" value="${safe(orderId)}">`
      : `<div class="form-group span-2"><label>Ordem de serviço *</label><select class="select" name="orderId" required><option value="">Selecione a OS</option>${activeOrders.map(o=>{const eq=getEquipment(o.equipmentId);return `<option value="${safe(o.id)}">OS ${safe(o.number)} · ${safe(equipmentDescription(eq))}</option>`}).join('')}</select></div>`;
    openModal('Solicitação técnica de peça',`<form id="add-part-form" class="form-grid">${orderField}<div class="technical-callout span-2"><span>${icon('tools',20)}</span><div><strong>Preenchimento da Oficina</strong>Informe apenas os dados técnicos encontrados na desmontagem. A solicitação seguirá separadamente para Compras.</div></div><div class="form-group"><label>Peça *</label><input class="input" name="name" list="part-name-list" required placeholder="Ex.: Retentor"><datalist id="part-name-list">${[...(db.catalog?.partNames||[]),...COMMON_PARTS].filter((v,i,a)=>a.indexOf(v)===i).map(item=>`<option value="${safe(item)}"></option>`).join('')}</datalist></div><div class="form-group"><label>Aplicação / posição</label><input class="input" name="position" placeholder="Ex.: mancal dianteiro"></div><div class="form-group"><label>Código / referência</label><input class="input" name="code" placeholder="Ex.: 6208-2RS-C3"><small>Código comercial ou referência do fabricante.</small></div><div class="form-group"><label>Medidas</label><input class="input" name="dimensions" placeholder="Ex.: 45 × 62 × 10 mm"><small>Diâmetro, largura, rosca ou dimensão física.</small></div><div class="form-group"><label>Quantidade *</label><input class="input" type="number" min="0.01" step="0.01" name="quantity" value="1" required></div><div class="form-group"><label>Unidade *</label><select class="select" name="unit" required><option>un</option><option>jogo</option><option>m</option><option>kg</option><option>L</option></select></div><div class="form-group span-2"><label>Especificação / observação técnica</label><textarea class="textarea" name="technicalNote" placeholder="Material, tipo de vedação, folga C3, blindagem, sentido, equivalência permitida..."></textarea></div><div class="form-group span-2"><label>Foto da peça ou referência <small>(opcional)</small></label><input class="input" type="file" accept="image/*" name="photo"><small>A foto ajuda a evitar compra de peça errada.</small></div></form>`,`<button class="btn btn-light" data-action="close-modal">Cancelar</button><button class="btn btn-primary" data-action="submit-part">${icon('save')} Registrar necessidade</button>`);
  }

  function purchaseModal(orderId,partId) {
    const order=getOrder(orderId),part=order?.parts.find(p=>p.id===partId); if(!order||!part)return;
    const purchase=part.purchase||{};
    openModal('Dados da compra',`<form id="purchase-form" class="form-grid"><input type="hidden" name="orderId" value="${safe(orderId)}"><input type="hidden" name="partId" value="${safe(partId)}"><div class="technical-callout"><span>${icon('gear',20)}</span><div><strong>${safe(part.name)}</strong>Código: ${safe(part.code||'não informado')} · Medidas: ${safe(part.dimensions||'não informadas')} · Quantidade: ${safe(partQuantity(part))}</div></div><div class="form-group"><label>Fornecedor</label><input class="input" name="supplier" value="${safe(purchase.supplier||'')}" placeholder="Fornecedor selecionado"></div><div class="form-group"><label>Previsão de entrega</label><input class="input" type="date" name="expectedDate" value="${safe(purchase.expectedDate||'')}"></div><div class="form-group"><label>Nº da cotação / pedido</label><input class="input" name="quote" value="${safe(purchase.quote||'')}" placeholder="Ex.: PC-1845"></div><div class="form-group"><label>Valor</label><input class="input" name="price" value="${safe(purchase.price||'')}" placeholder="Ex.: R$ 185,00"></div><div class="form-group span-2"><label>Local após recebimento</label><input class="input" name="location" value="${safe(purchase.location||'')}" placeholder="Ex.: Caixa OS ${safe(order.number)}"></div><div class="form-group span-2"><label>Observação de Compras</label><textarea class="textarea" name="note" placeholder="Condições, equivalência aprovada, contato do fornecedor...">${safe(purchase.note||'')}</textarea></div></form>`,`<button class="btn btn-light" data-action="close-modal">Cancelar</button><button class="btn btn-primary" data-action="submit-purchase">${icon('save')} Salvar dados da compra</button>`);
  }

  function addMeasurementModal(orderId) {
    openModal('Registrar medição ou teste',`<form id="add-measurement-form" class="form-grid"><input type="hidden" name="orderId" value="${safe(orderId)}"><div class="form-group span-2"><label>Parâmetro *</label><input class="input" name="name" required placeholder="Ex.: Vibração radial X"></div><div class="form-group"><label>Unidade *</label><input class="input" name="unit" required placeholder="mm/s, °C, A, MΩ..."></div><div class="form-group"><label>Limite / referência</label><input class="input" name="limit" placeholder="Ex.: ≤ 4,5"></div><div class="form-group"><label>Valor antes</label><input class="input" name="before" placeholder="Ex.: 6,8"></div><div class="form-group"><label>Valor depois *</label><input class="input" name="after" required placeholder="Ex.: 2,1"></div><div class="form-group span-2"><label>Resultado</label><select class="select" name="status"><option>Registrado</option><option>Conforme</option><option>Não conforme</option><option>Não se aplica</option></select></div></form>`,`<button class="btn btn-light" data-action="close-modal">Cancelar</button><button class="btn btn-primary" data-action="submit-measurement">${icon('save')} Registrar medição</button>`);
  }

  function newClientModal(){openModal('Novo cliente',`<form id="new-client-form" class="form-grid"><div class="form-group span-2"><label>Razão social / nome</label><input class="input" name="name" required></div><div class="form-group"><label>Contato</label><input class="input" name="contact"></div><div class="form-group"><label>E-mail</label><input class="input" type="email" name="email" required></div></form>`,`<button class="btn btn-light" data-action="close-modal">Cancelar</button><button class="btn btn-primary" data-action="submit-client">Salvar</button>`)}
  function newEquipmentModal(){openModal('Novo equipamento',`<form id="new-equipment-form" class="form-grid"><div class="form-group"><label>Cliente *</label><select class="select" name="clientId" required>${db.clients.map(c=>`<option value="${safe(c.id)}">${safe(c.name)}</option>`).join('')}</select></div><div class="form-group"><label>TAG do cliente <small>(opcional)</small></label><input class="input" name="tag" placeholder="Se não informar, será gerado um código interno"></div><div class="form-group span-2 smart-entry"><div class="smart-entry-title"><span>${icon('edit',19)}</span><div><strong>Descrição livre do equipamento</strong><small>Digite como a equipe conhece: “Motor WEG 3 cv”, “Bomba KSB 80-200”...</small></div></div><input class="input" name="description" list="equipment-description-list" required placeholder="Ex.: Motor WEG 3 cv"><datalist id="equipment-description-list">${equipmentSuggestions().map(item=>`<option value="${safe(item)}"></option>`).join('')}</datalist></div><div class="form-section"><strong>Detalhes técnicos opcionais</strong><p>O sistema tenta identificar alguns dados pela descrição. Complete somente o que estiver disponível.</p></div><div class="form-group"><label>Tipo</label><input class="input" name="type" list="equipment-type-list"><datalist id="equipment-type-list">${EQUIPMENT_TYPES.map(item=>`<option value="${safe(item)}"></option>`).join('')}</datalist></div><div class="form-group"><label>Fabricante</label><input class="input" name="manufacturer" list="manufacturer-list"><datalist id="manufacturer-list">${(db.catalog?.manufacturers||MANUFACTURERS).map(item=>`<option value="${safe(item)}"></option>`).join('')}</datalist></div><div class="form-group"><label>Modelo</label><input class="input" name="model"></div><div class="form-group"><label>Potência</label><input class="input" name="power" placeholder="Ex.: 3 cv"></div><div class="form-group span-2"><label>Número de série</label><input class="input" name="serial"></div></form>`,`<button class="btn btn-light" data-action="close-modal">Cancelar</button><button class="btn btn-primary" data-action="submit-equipment">Salvar equipamento</button>`)}

  function handleClick(event) {
    const target=event.target.closest('[data-action]'); if(!target) return;
    const action=target.dataset.action;
    if(action==='toggle-menu'){const sidebar=document.getElementById('sidebar'),overlay=document.getElementById('sidebar-overlay');sidebar.classList.toggle('open');overlay.hidden=!sidebar.classList.contains('open');return;}
    if(action==='close-modal'){closeModal();return;}
    if(action==='new-order'){newOrderModal(1,true);return;}
    if(action==='wizard-next'){const step=Number(target.dataset.step);if(collectWizardStep(step))newOrderModal(step+1);return;}
    if(action==='wizard-back'){newOrderModal(Math.max(1,Number(target.dataset.step)-1));return;}
    if(action==='new-client'){newClientModal();return;}
    if(action==='new-equipment'){newEquipmentModal();return;}
    if(action==='open-order'){location.hash=`#order/${target.dataset.id}`;return;}
    if(action==='open-report'){location.hash=`#reports/${target.dataset.id}`;return;}
    if(action==='add-part'){saveStageData(getOrder(target.dataset.id),false);addPartModal(target.dataset.id);return;}
    if(action==='edit-purchase'){purchaseModal(target.dataset.order,target.dataset.part);return;}
    if(action==='add-measurement'){saveStageData(getOrder(target.dataset.id),false);addMeasurementModal(target.dataset.id);return;}
    if(action==='toggle-no-parts'){const order=getOrder(target.dataset.id);saveStageData(order,false);order.noPartsRequired=!order.noPartsRequired;saveDB();render();toast(order.noPartsRequired?'OS marcada sem necessidade de peças.':'Marcação removida.');return;}
    if(action==='new-part-global'){addPartModal();return;}
    if(action==='submit-new-order'){submitNewOrder();return;}
    if(action==='submit-part'){submitPart();return;}
    if(action==='submit-purchase'){submitPurchase();return;}
    if(action==='submit-measurement'){submitMeasurement();return;}
    if(action==='submit-client'){submitClient();return;}
    if(action==='submit-equipment'){submitEquipment();return;}
    if(action==='advance-stage'){advanceStage(target.dataset.id);return;}
    if(action==='advance-part'){advancePart(target.dataset.order,target.dataset.part);return;}
    if(action==='save-notes'){const order=getOrder(target.dataset.id);order.notes=(document.getElementById('order-notes')?.value||order.notes||'').trim();addActivity(`Rascunho da OS ${order.number} salvo pela equipe ${stageTeam(order.stage)}.`);saveDB();render();toast('Rascunho salvo. Agora o sistema conferiu as pendências.');return;}
    if(action==='delete-photo'){const order=getOrder(target.dataset.order);saveStageData(order,false);order.photos[target.dataset.group].splice(Number(target.dataset.index),1);saveDB();render();toast('Foto removida.');return;}
    if(action==='approve-report'){approveReport(target.dataset.id);return;}
    if(action==='send-report'){sendReport(target.dataset.id);return;}
    if(action==='schedule-report'){scheduleReport(target.dataset.id);return;}
    if(action==='print-report'){window.print();return;}
    if(action==='portal-approve'){toast('Orçamento aprovado e oficina notificada.');return;}
    if(action==='save-settings'){const nameEl=document.getElementById('company-name'),unitEl=document.getElementById('company-unit'),emailEl=document.getElementById('company-email');if(!nameEl?.value.trim())return toast('Informe o nome da oficina.','error');if(!emailEl?.value.trim()||!emailEl.checkValidity())return toast('Informe um e-mail válido para os relatórios.','error');db.company.name=nameEl.value.trim();db.company.unit=unitEl?.value.trim()||'';db.company.email=emailEl.value.trim();saveDB();render();toast('Configurações salvas.');return;}
    if(action==='export-data'){exportData();return;}
    if(action==='reset-data'){if(confirm('ATENÇÃO: esta ação substitui os dados locais atuais pelos dados de demonstração. Deseja realmente continuar?')){db=seedDB();saveDB();render();toast('Dados de demonstração restaurados.');}return;}
  }

  function submitNewOrder(){
    if(!newOrderDraft){toast('O cadastro da OS expirou. Inicie novamente.','error');return;}
    const client=getClient(newOrderDraft.clientId); if(!client){toast('Cliente inválido.','error');return;}
    const typedDescription=String(newOrderDraft.equipmentText||'').trim().replace(/\s+/g,' ');
    if(!typedDescription){toast('Digite o equipamento.','error');return;}
    const normalized=typedDescription.toLocaleLowerCase('pt-BR');
    let eq=db.equipment.find(item=>item.clientId===client.id && equipmentDescription(item).toLocaleLowerCase('pt-BR')===normalized);
    if(eq){
      if(newOrderDraft.equipmentTag && (!eq.tag || /^EQ-/.test(eq.tag))) eq.tag=String(newOrderDraft.equipmentTag).trim();
      if(newOrderDraft.equipmentSerial && !eq.serial) eq.serial=String(newOrderDraft.equipmentSerial).trim();
      addActivity(`${equipmentDescription(eq)} reutilizado da base de ${client.name}.`);
    } else {
      const parsed=parseEquipmentDescription(typedDescription);
      eq={id:id('e'),clientId:client.id,tag:String(newOrderDraft.equipmentTag||'').trim()||nextEquipmentCode(),description:parsed.description,type:parsed.type,manufacturer:parsed.manufacturer,model:parsed.model,power:parsed.power,serial:String(newOrderDraft.equipmentSerial||'').trim()};
      db.equipment.push(eq);
      rememberEquipmentDescription(eq.description);
      addActivity(`${eq.description} salvo automaticamente na base de ${client.name}.`);
    }
    const order={id:id('o'),number:nextOrderNumber(),clientId:client.id,equipmentId:eq.id,entryDate:newOrderDraft.entryDate,dueDate:newOrderDraft.dueDate,stage:'entrada',defect:newOrderDraft.defect,technician:newOrderDraft.technician||'A definir',supervisor:'A definir',notes:'',noPartsRequired:false,createdAt:new Date().toISOString(),availableSince:new Date().toISOString(),handoffs:[],reception:{receivedBy:newOrderDraft.receivedBy||'',condition:newOrderDraft.condition||'',accessories:newOrderDraft.accessories||''},parts:[],measurements:[],photos:{before:[],during:[],after:[]},report:{approved:false,sent:false,scheduledAt:'',sentAt:'',recipient:client.email}};
    db.orders.unshift(order);addActivity(`OS ${order.number} gerada automaticamente para ${client.name} e disponibilizada à Recepção.`);saveDB();newOrderDraft=null;closeModal();location.hash=`#order/${order.id}`;toast(`OS ${order.number} criada para ${equipmentDescription(eq)}.`);
  }

  async function submitPart(){const form=document.getElementById('add-part-form');if(!form.reportValidity())return;const data=Object.fromEntries(new FormData(form));const order=getOrder(data.orderId);if(!order){toast('Selecione uma OS válida.','error');return;}let photo='';const file=form.elements.photo?.files?.[0];if(file){try{photo=(await fileToPhoto(file,'Peça solicitada')).src;}catch(error){toast(error?.message||'Não foi possível processar a foto da peça.','error');return;}}const part={id:id('p'),name:data.name.trim(),code:(data.code||'').trim(),dimensions:(data.dimensions||'').trim(),quantity:data.quantity||'1',unit:data.unit||'un',position:(data.position||'').trim(),technicalNote:(data.technicalNote||'').trim(),photo,status:'Solicitada',requestedBy:'Oficina',purchase:{supplier:'',expectedDate:'',quote:'',price:'',note:'',location:''}};order.parts.push(part);order.noPartsRequired=false;db.catalog=db.catalog||{};db.catalog.partNames=db.catalog.partNames||[];if(!db.catalog.partNames.includes(part.name))db.catalog.partNames.unshift(part.name);addActivity(`${part.name} solicitado tecnicamente para a OS #${order.number} e enviado para Compras.`);saveDB();closeModal();render();toast('Solicitação técnica enviada para Compras.');}
  function submitPurchase(){const form=document.getElementById('purchase-form');if(!form?.reportValidity())return;const data=Object.fromEntries(new FormData(form));const order=getOrder(data.orderId),part=order?.parts.find(p=>p.id===data.partId);if(!part)return;part.purchase={supplier:(data.supplier||'').trim(),expectedDate:data.expectedDate||'',quote:(data.quote||'').trim(),price:(data.price||'').trim(),note:(data.note||'').trim(),location:(data.location||'').trim()};if(part.status==='Solicitada'&&(part.purchase.supplier||part.purchase.quote))part.status='Em cotação';addActivity(`Compras atualizou ${part.name} da OS #${order.number}.`);saveDB();closeModal();render();toast('Dados da compra atualizados.');}
  function submitMeasurement(){const form=document.getElementById('add-measurement-form');if(!form.reportValidity())return;const data=Object.fromEntries(new FormData(form));const order=getOrder(data.orderId);order.measurements.push({name:data.name,unit:data.unit,before:data.before||'—',after:data.after,limit:data.limit||'—',status:data.status||'Registrado'});addActivity(`${data.name} registrado na OS ${order.number}.`);saveDB();closeModal();render();toast('Medição registrada.');}
  function submitClient(){const form=document.getElementById('new-client-form');if(!form.reportValidity())return;const data=Object.fromEntries(new FormData(form));db.clients.push({id:id('c'),name:data.name,contact:data.contact,email:data.email,active:true});saveDB();closeModal();render();toast('Cliente cadastrado.');}
  function submitEquipment(){const form=document.getElementById('new-equipment-form');if(!form.reportValidity())return;const data=Object.fromEntries(new FormData(form));const parsed=parseEquipmentDescription(data.description);const eq={id:id('e'),clientId:data.clientId,tag:(data.tag||'').trim()||nextEquipmentCode(),description:parsed.description,type:(data.type||'').trim()||parsed.type,manufacturer:(data.manufacturer||'').trim()||parsed.manufacturer,model:(data.model||'').trim()||parsed.model,power:(data.power||'').trim()||parsed.power,serial:(data.serial||'').trim()};db.equipment.push(eq);rememberEquipmentDescription(eq.description);saveDB();closeModal();render();toast(`${eq.description} cadastrado e salvo para reutilização.`);}
  function advanceStage(orderId) {
    try {
      const order=getOrder(orderId); if(!order) throw new Error('OS não encontrada');
      saveStageData(order,false);
      const pending=stageRequirements(order).filter(item=>!item.ok);
      if(pending.length){
        saveDB();render();
        const message=pending.length===1?pending[0].label:`Faltam ${pending.length} itens: ${pending.map(item=>item.label).join('; ')}`;
        toast(`Etapa não concluída. ${message}.`,'error');
        setTimeout(()=>document.querySelector('.requirement.pending')?.scrollIntoView({behavior:'smooth',block:'center'}),80);
        return;
      }
      if(order.stage==='relatorio'){location.hash=`#reports/${order.id}`;return;}
      const from=STAGES.find(s=>s.id===order.stage),to=nextStageForOrder(order);
      if(!from||!to||from.id===to.id) return;
      order.handoffs=order.handoffs||[];
      order.handoffs.push({fromStage:from.id,toStage:to.id,fromTeam:from.team,toTeam:to.team,at:new Date().toISOString()});
      order.stage=to.id;order.availableSince=new Date().toISOString();
      addActivity(`OS ${order.number}: ${from.team} concluiu ${from.label} e liberou para ${to.team}.`);
      saveDB();render();toast(`Etapa concluída. OS disponível para ${to.team}.`);
    } catch(error) {
      console.error(error);toast(`Não foi possível avançar a OS: ${error.message}`,'error');
    }
  }
  function advancePart(orderId,partId){const order=getOrder(orderId),part=order?.parts.find(p=>p.id===partId);if(!part)return;const idx=PART_STATUSES.indexOf(part.status),next=PART_STATUSES[idx+1];if(!next)return;if(part.status==='Em cotação'&&!partSupplier(part)){toast('Antes de marcar como comprada, informe o fornecedor em “Dados da compra”.','error');return;}part.status=next;if(part.status==='Recebida'&&!partLocation(part))part.purchase.location=`Caixa OS ${order.number}`;addActivity(`${part.name} da OS #${order.number}: ${part.status}.`);saveDB();render();toast(`Peça atualizada para ${part.status}.`);}
  function approveReport(orderId){const order=getOrder(orderId);if(!reportReady(order)){toast('O relatório possui pendências obrigatórias.','error');return;}order.report.approved=true;addActivity(`Relatório da OS #${order.number} aprovado por ${order.supervisor}.`);saveDB();render();toast('Relatório aprovado.');}
  function sendReport(orderId){const order=getOrder(orderId);if(!reportReady(order)){toast('Envio bloqueado: faltam dados obrigatórios.','error');return;}if(!order.report.approved){toast('Envio bloqueado: o supervisor ainda não aprovou.','error');return;}order.report.sent=true;order.report.sentAt=new Date().toISOString();if(order.stage!=='concluida'){order.handoffs=order.handoffs||[];order.handoffs.push({fromStage:order.stage,toStage:'concluida',fromTeam:stageTeam(order.stage),toTeam:stageTeam('concluida'),at:new Date().toISOString()});order.stage='concluida';order.availableSince=new Date().toISOString();}addActivity(`Relatório da OS ${order.number} enviado para ${order.report.recipient}. Processo concluído.`);saveDB();render();toast('Relatório enviado. OS concluída e disponível ao cliente.');}
  function scheduleReport(orderId){const value=document.getElementById('schedule-at').value;if(!value){toast('Informe uma data e horário.','error');return;}const order=getOrder(orderId);order.report.scheduledAt=value;saveDB();render();toast('Envio agendado.');}
  async function handlePhotoUpload(input){const order=getOrder(input.dataset.order),group=input.dataset.group,files=[...input.files].slice(0,6);if(!order)return;order.photos[group]=order.photos[group]||[];let added=0;for(const file of files){try{order.photos[group].push(await fileToPhoto(file,group||''));added++;}catch(error){toast(error?.message||`Não foi possível processar ${file.name}.`,'error');}}input.value='';if(added){saveDB();render();toast(`${added} foto(s) adicionada(s) e compactada(s) automaticamente.`);}}
  function fileToDataURL(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});}
  function exportData(){const blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`ar7-oficina-backup-${todayISO()}.json`;a.click();URL.revokeObjectURL(url);toast('Backup exportado.');}

  function handleInput(event){if(event.target.matches('[data-action="photo-upload"]'))handlePhotoUpload(event.target);if(event.target.id==='import-file'){const file=event.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const incoming=JSON.parse(reader.result);if(!incoming.orders||!incoming.clients)throw new Error();db=incoming;db.version=APP_VERSION;saveDB();render();toast('Backup importado.');}catch{toast('Arquivo de backup inválido.','error');}};reader.readAsText(file);}}
  function handleFilter(){const search=(document.getElementById('order-search')?.value||'').toLowerCase();const stage=document.getElementById('order-stage-filter')?.value||'';document.querySelectorAll('#orders-table tbody tr').forEach(row=>{const orderNumber=row.cells[0]?.textContent.trim().replace('#','');const order=db.orders.find(o=>o.number===orderNumber);const text=row.textContent.toLowerCase();row.style.display=text.includes(search)&&(!stage||order?.stage===stage)?'':'none';});}



  /* ==============================================================
     V5 - FLUXO SIMPLIFICADO, RECEBIMENTO COMPLETO, PDF E ANOTAÇÕES
     ============================================================== */
  function safe(value='') {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  }

  function normalizePhotoV5(photo, defaultCaption='') {
    if (!photo) return null;
    if (typeof photo === 'string') return { id:id('ph'), src:photo, caption:defaultCaption, annotations:[], width:600, height:420 };
    return {
      id: photo.id || id('ph'),
      src: photo.src || photo.data || '',
      caption: photo.caption || defaultCaption || '',
      annotations: Array.isArray(photo.annotations) ? photo.annotations.map(a => ({
        x1:Number(a.x1)||0, y1:Number(a.y1)||0, x2:Number(a.x2)||0, y2:Number(a.y2)||0,
        color:a.color || '#c9202f', width:Number(a.width)||6
      })) : [],
      width: Number(photo.width) || 600,
      height: Number(photo.height) || 420
    };
  }

  function normalizeAfterLoadV5(parsed) {
    if (!parsed) return parsed;
    parsed.version = APP_VERSION;
    parsed.clients = (parsed.clients || []).map(client => ({
      cnpj:'', phone:'', address:'', city:'', state:'', notes:'', contact:'', email:'', active:true, ...client
    }));
    parsed.orders = (parsed.orders || []).map(order => {
      const oldNotes = order.notes || '';
      const photos = order.photos || {};
      return {
        ...order,
        records: {
          diagnosis: order.records?.diagnosis || oldNotes || '',
          assembly: order.records?.assembly || '',
          tests: order.records?.tests || '',
          conclusion: order.records?.conclusion || oldNotes || ''
        },
        reception: {
          receivedBy:'', condition:'', accessories:'', deliveryContact:'', ...order.reception
        },
        photos: {
          before:(photos.before || []).map(p => normalizePhotoV5(p,'Recebimento')),
          during:(photos.during || []).map(p => normalizePhotoV5(p,'Diagnóstico / desmontagem')),
          assembly:(photos.assembly || []).map(p => normalizePhotoV5(p,'Montagem')),
          after:(photos.after || []).map(p => normalizePhotoV5(p,'Equipamento finalizado'))
        }
      };
    });
    return parsed;
  }

  function photoSrc(photo) { return typeof photo === 'string' ? photo : (photo?.src || ''); }

  function arrowMarkup(annotation) {
    const a = annotation;
    const dx=a.x2-a.x1, dy=a.y2-a.y1, len=Math.hypot(dx,dy)||1;
    const ux=dx/len, uy=dy/len, size=22+(Number(a.width)||6)*3;
    const bx=a.x2-ux*size, by=a.y2-uy*size, px=-uy, py=ux;
    const left=`${bx+px*size*.42},${by+py*size*.42}`;
    const right=`${bx-px*size*.42},${by-py*size*.42}`;
    const color=safe(a.color || '#c9202f');
    const width=Math.max(2,Number(a.width)||6)*2;
    return `<line x1="${a.x1}" y1="${a.y1}" x2="${bx+ux*3}" y2="${by+uy*3}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/><polygon points="${a.x2},${a.y2} ${left} ${right}" fill="${color}"/>`;
  }

  function annotatedPhoto(photo, className='', alt='Foto do serviço') {
    const normalized=normalizePhotoV5(photo);
    if (!normalized?.src) return '';
    const aspect=`${normalized.width || 4}/${normalized.height || 3}`;
    return `<div class="annotated-photo ${className}" style="aspect-ratio:${aspect}"><img src="${safe(normalized.src)}" alt="${safe(alt)}"><svg viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">${normalized.annotations.map(arrowMarkup).join('')}</svg></div>`;
  }

  const PHOTO_MAX_SOURCE_BYTES_V201=35*1024*1024;
  const PHOTO_TARGET_BYTES_V201=420*1024;
  const PHOTO_MAX_SIDE_V201=1600;

  function dataUrlBytesV201(value='') {
    const comma=String(value).indexOf(',');
    const payload=comma>=0?String(value).slice(comma+1):String(value);
    return Math.ceil(payload.length*3/4);
  }

  function imageFromFileV201(file) {
    return new Promise((resolve,reject)=>{
      const url=URL.createObjectURL(file);
      const img=new Image();
      img.onload=()=>{URL.revokeObjectURL(url);resolve(img);};
      img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('Formato de imagem não suportado neste dispositivo.'));};
      img.src=url;
    });
  }

  function canvasDataUrlV201(canvas,quality) {
    if(typeof canvas.toBlob!=='function') return Promise.resolve(canvas.toDataURL('image/jpeg',quality));
    return new Promise((resolve,reject)=>{
      canvas.toBlob(blob=>{
        if(!blob){reject(new Error('Não foi possível compactar a imagem.'));return;}
        const reader=new FileReader();
        reader.onload=()=>resolve(reader.result);
        reader.onerror=()=>reject(reader.error||new Error('Falha ao ler a imagem compactada.'));
        reader.readAsDataURL(blob);
      },'image/jpeg',quality);
    });
  }

  async function fileToPhoto(file, caption='') {
    if(!file) throw new Error('Nenhuma imagem selecionada.');
    if(file.size>PHOTO_MAX_SOURCE_BYTES_V201) throw new Error(`A imagem ${file.name||''} excede 35 MB.`);
    const image=await imageFromFileV201(file);
    const naturalWidth=image.naturalWidth||image.width||600;
    const naturalHeight=image.naturalHeight||image.height||420;
    let scale=Math.min(1,PHOTO_MAX_SIDE_V201/Math.max(naturalWidth,naturalHeight));
    let width=Math.max(1,Math.round(naturalWidth*scale));
    let height=Math.max(1,Math.round(naturalHeight*scale));
    let quality=0.80;
    let src='';
    const canvas=document.createElement('canvas');
    const render=()=>{
      canvas.width=width;canvas.height=height;
      const ctx=canvas.getContext('2d',{alpha:false});
      ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);ctx.drawImage(image,0,0,width,height);
    };
    render();
    for(let pass=0;pass<7;pass++){
      src=await canvasDataUrlV201(canvas,quality);
      if(dataUrlBytesV201(src)<=PHOTO_TARGET_BYTES_V201) break;
      if(quality>0.58){quality=Math.max(0.58,quality-0.07);continue;}
      width=Math.max(900,Math.round(width*0.86));
      height=Math.max(1,Math.round(naturalHeight*(width/naturalWidth)));
      quality=0.72;
      render();
    }
    return {id:id('ph'),src,caption,annotations:[],width,height,originalBytes:file.size,compressedBytes:dataUrlBytesV201(src)};
  }
  function photoGalleryV5(order, group, label, description='') {
    const list=order.photos[group] || [];
    return `<section class="stage-photo-block" data-photo-group="${group}"><div class="stage-photo-head"><div><div class="section-eyebrow">EVIDÊNCIAS · ${list.length} FOTO(S)</div><h3>${safe(label)}</h3>${description?`<p>${safe(description)}</p>`:''}</div><div class="photo-upload-actions-v201"><label class="btn btn-primary btn-sm">${icon('camera',15)} Câmera<input type="file" accept="image/*" capture="environment" hidden data-action="photo-upload" data-order="${order.id}" data-group="${group}"></label><label class="btn btn-light btn-sm">${icon('file',15)} Galeria<input type="file" accept="image/*" multiple hidden data-action="photo-upload" data-order="${order.id}" data-group="${group}"></label></div></div><div class="photo-grid photo-grid-v5">${list.map((photo,index)=>`<article class="photo-card-v5">${annotatedPhoto(photo,'','Foto '+label)}<div class="photo-card-actions"><button class="btn btn-light btn-sm" data-action="edit-photo" data-order="${order.id}" data-group="${group}" data-index="${index}">${icon('edit',14)} Setas e legenda</button><button class="icon-danger" data-action="delete-photo" data-order="${order.id}" data-group="${group}" data-index="${index}" aria-label="Excluir foto">${icon('trash',14)}</button></div>${photo.caption?`<small>${safe(photo.caption)}</small>`:'<small class="photo-caption-empty">Sem legenda</small>'}</article>`).join('') || `<label class="photo-empty-v5">${icon('camera',30)}<strong>Nenhuma foto adicionada</strong><span>Use Câmera ou Galeria acima. Fotos grandes são compactadas automaticamente.</span><input type="file" accept="image/*" multiple hidden data-action="photo-upload" data-order="${order.id}" data-group="${group}"></label>`}</div></section>`;
  }
  function partsTableV5(order, purchaseMode=false) {
    const rows=(order.parts||[]).map(part=>{
      const index=PART_STATUSES.indexOf(part.status);
      const next=PART_STATUSES[index+1]||'';
      const actionLabel=next?`Marcar como ${next}`:'Fluxo concluído';
      return `<tr><td>${part.photo?`<img class="part-photo" src="${safe(part.photo)}" alt="Foto da peça">`:'<span class="part-photo-placeholder">—</span>'}</td><td><strong>${safe(part.name)}</strong><br><span class="muted-small">${safe(part.position||'Aplicação não informada')}</span>${part.technicalNote?`<details class="inline-details"><summary>Especificação técnica</summary><p>${safe(part.technicalNote)}</p></details>`:''}</td><td>${safe(part.code||'—')}</td><td>${safe(part.dimensions||'—')}</td><td>${safe(partQuantity(part))}</td><td>${badge(part.status,partTone(part.status))}</td><td><div class="row-actions">${purchaseMode?`<button class="btn btn-light btn-sm" data-action="edit-purchase" data-order="${order.id}" data-part="${part.id}">Dados da compra</button><button class="btn btn-primary btn-sm" data-action="advance-part" data-order="${order.id}" data-part="${part.id}" ${!next?'disabled':''}>${safe(actionLabel)}</button>`:''}</div></td></tr>`;
    }).join('');
    return `<div class="table-wrap parts-table-wrap"><table class="table parts-table"><thead><tr><th>Foto</th><th>Peça / aplicação</th><th>Código</th><th>Medidas</th><th>Qtd.</th><th>Status</th><th>${purchaseMode?'Próxima ação':' '}</th></tr></thead><tbody>${rows||'<tr><td colspan="7"><div class="empty"><strong>Nenhuma peça informada</strong><span>Adicione uma necessidade técnica ou marque que o serviço não precisa de peças.</span></div></td></tr>'}</tbody></table></div>`;
  }
  function measurementsTableV5(order) {
    return `<div class="table-wrap"><table class="table"><thead><tr><th>Parâmetro</th><th>Unidade</th><th>Antes</th><th>Depois</th><th>Limite</th></tr></thead><tbody>${(order.measurements||[]).map(m=>`<tr><td><strong>${safe(m.name)}</strong></td><td>${safe(m.unit)}</td><td>${safe(m.before)}</td><td>${safe(m.after)}</td><td>${safe(m.limit)}</td></tr>`).join('')||'<tr><td colspan="5"><div class="empty">Nenhuma medição registrada.</div></td></tr>'}</tbody></table></div>`;
  }

  function stageRequirements(order) {
    const records=order.records || {};
    const availableParts=(order.parts||[]).filter(part=>['Recebida','Separada','Instalada'].includes(part.status)).length;
    const requirements={
      entrada:[
        {label:'Dados do recebimento preenchidos',ok:Boolean(order.defect&&order.dueDate&&order.reception?.receivedBy)},
        {label:'Pelo menos uma foto no recebimento',ok:(order.photos.before||[]).length>0}
      ],
      diagnostico:[
        {label:'Diagnóstico técnico registrado',ok:Boolean(records.diagnosis?.trim().length>=10)},
        {label:'Fotos da desmontagem ou diagnóstico',ok:(order.photos.during||[]).length>0},
        {label:'Peças informadas ou marcado “não precisa de peças”',ok:order.noPartsRequired||(order.parts||[]).length>0}
      ],
      pecas:[
        {label:'Todas as peças recebidas e identificadas',ok:order.noPartsRequired||((order.parts||[]).length>0&&availableParts===(order.parts||[]).length)}
      ],
      montagem:[
        {label:'Serviço de montagem registrado',ok:Boolean(records.assembly?.trim().length>=10)},
        {label:'Fotos realizadas durante a montagem',ok:(order.photos.assembly||[]).length>0}
      ],
      testes:[
        {label:'Resultado dos testes registrado',ok:Boolean(records.tests?.trim().length>=5)},
        {label:'Pelo menos uma medição registrada',ok:(order.measurements||[]).length>0},
        {label:'Fotos finais do equipamento',ok:(order.photos.after||[]).length>0}
      ],
      relatorio:[
        {label:'Relatório técnico completo',ok:reportReady(order)},
        {label:'Aprovação do supervisor',ok:Boolean(order.report?.approved)},
        {label:'Relatório enviado ao cliente',ok:Boolean(order.report?.sent)}
      ],
      concluida:[{label:'Processo concluído e disponível ao cliente',ok:true}]
    };
    return requirements[order.stage] || [];
  }

  function nextStageForOrder(order) {
    if(order.stage==='diagnostico' && order.noPartsRequired) return STAGES.find(s=>s.id==='montagem');
    return nextStage(order.stage);
  }

  function handoffButtonLabelV5(order) {
    if(order.stage==='diagnostico'&&order.noPartsRequired) return 'Concluir diagnóstico e liberar Montagem';
    return ({entrada:'Concluir recebimento e liberar Oficina',diagnostico:'Concluir diagnóstico e enviar para Compras',pecas:'Liberar materiais para Montagem',montagem:'Concluir montagem e enviar para Testes',testes:'Concluir testes e liberar Relatório'})[order.stage]||'Concluir etapa';
  }

  function currentStageWorkspace(order) {
    const records=order.records||{};
    if(order.stage==='entrada') return `<section class="card stage-workspace"><div class="card-head"><div><h2>Recebimento completo</h2><p>Todos os dados e fotos ficam juntos antes de liberar a Oficina.</p></div></div><div class="card-body form-grid"><div class="form-group"><label for="stage-entry-date">Data de entrada *</label><input class="input" type="date" id="stage-entry-date" value="${order.entryDate||todayISO()}" required></div><div class="form-group"><label for="stage-due-date">Prazo previsto *</label><input class="input" type="date" id="stage-due-date" value="${order.dueDate||''}" required></div><div class="form-group"><label for="stage-received-by">Recebido por *</label><input class="input" id="stage-received-by" value="${safe(order.reception?.receivedBy||'')}"></div><div class="form-group"><label for="stage-delivery-contact">Contato de quem entregou</label><input class="input" id="stage-delivery-contact" value="${safe(order.reception?.deliveryContact||'')}"></div><div class="form-group span-2"><label for="stage-defect">Defeito informado pelo cliente *</label><textarea class="textarea" id="stage-defect">${safe(order.defect||'')}</textarea></div><div class="form-group span-2"><label for="stage-condition">Condição no recebimento</label><textarea class="textarea" id="stage-condition">${safe(order.reception?.condition||'')}</textarea></div><div class="form-group span-2"><label for="stage-accessories">Acessórios recebidos</label><input class="input" id="stage-accessories" value="${safe(order.reception?.accessories||'')}"></div><div class="span-2">${photoGalleryV5(order,'before','Fotos do recebimento','Plaqueta, lados do equipamento, danos, acessórios e condição de chegada.')}</div></div></section>`;
    if(order.stage==='diagnostico') return `<section class="card stage-workspace"><div class="card-head"><div><h2>Diagnóstico e desmontagem</h2><p>Registre apenas o que a Oficina identificou tecnicamente.</p></div><div class="row-actions"><button class="btn btn-light btn-sm" data-action="toggle-no-parts" data-id="${order.id}">${order.noPartsRequired?'Desmarcar sem peças':'Não precisa de peças'}</button><button class="btn btn-primary btn-sm" data-action="add-part" data-id="${order.id}">${icon('plus',14)} Adicionar peça</button></div></div><div class="card-body stack"><div class="form-group"><label for="stage-record">Diagnóstico técnico *</label><textarea class="textarea stage-large-text" id="stage-record" placeholder="Descreva desmontagem, falhas encontradas e serviço necessário...">${safe(records.diagnosis||'')}</textarea></div>${photoGalleryV5(order,'during','Fotos do diagnóstico e desmontagem','As setas podem ser adicionadas depois em cada foto.')}${partsTableV5(order,false)}</div></section>`;
    if(order.stage==='pecas') return `<section class="card stage-workspace"><div class="card-head"><div><h2>Peças e Compras</h2><p>A Oficina já informou código e medidas. Compras completa somente os dados comerciais.</p></div></div>${partsTableV5(order,true)}</section>`;
    if(order.stage==='montagem') return `<section class="card stage-workspace"><div class="card-head"><div><h2>Montagem do equipamento</h2><p>O registro da montagem e as fotos ficam juntos nesta etapa.</p></div></div><div class="card-body stack"><div class="form-group"><label for="stage-record">Serviços executados na montagem *</label><textarea class="textarea stage-large-text" id="stage-record" placeholder="Peças instaladas, ajustes, torque, alinhamento, folgas e observações...">${safe(records.assembly||'')}</textarea></div>${photoGalleryV5(order,'assembly','Fotos durante a montagem','Registre peças instaladas, ajustes, alinhamento e fechamento do equipamento.')}${partsTableV5(order,false)}</div></section>`;
    if(order.stage==='testes') return `<section class="card stage-workspace"><div class="card-head"><div><h2>Testes finais e qualidade</h2><p>Medições, resultado e fotos finais no mesmo lugar.</p></div><button class="btn btn-primary btn-sm" data-action="add-measurement" data-id="${order.id}">${icon('plus',14)} Adicionar medição</button></div><div class="card-body stack"><div class="form-group"><label for="stage-record">Resultado dos testes *</label><textarea class="textarea" id="stage-record" placeholder="Informe comportamento, condições do teste e resultado final...">${safe(records.tests||'')}</textarea></div>${measurementsTableV5(order)}${photoGalleryV5(order,'after','Fotos finais','Equipamento montado, plaqueta, teste e condição final.')}</div></section>`;
    if(order.stage==='relatorio') return `<section class="card stage-workspace"><div class="card-body report-ready-card"><div class="report-ready-icon">${icon('file',34)}</div><div><h2>Dados liberados para o relatório</h2><p>A Recepção, Oficina, Compras e Qualidade já finalizaram suas etapas. Revise o documento, ajuste a conclusão e gere o PDF.</p></div><button class="btn btn-primary" data-action="open-report" data-id="${order.id}">${icon('file')} Abrir gerador de relatório</button></div></section>`;
    return `<section class="card stage-workspace"><div class="card-body report-ready-card"><div class="report-ready-icon success">${icon('check',34)}</div><div><h2>Serviço concluído</h2><p>O relatório foi enviado e o histórico está disponível para consulta.</p></div><button class="btn btn-light" data-action="open-report" data-id="${order.id}">${icon('file')} Ver relatório</button></div></section>`;
  }

  function orderHistoryV5(order) {
    const groups=[['before','Recebimento'],['during','Diagnóstico'],['assembly','Montagem'],['after','Finalização']];
    return `<details class="history-details"><summary>${icon('clock',17)} Histórico completo da OS</summary><div class="history-body"><div class="history-records"><article><span>Recebimento</span><p>${safe(order.reception?.condition||'Sem observações')}</p></article><article><span>Diagnóstico</span><p>${safe(order.records?.diagnosis||'Não registrado')}</p></article><article><span>Montagem</span><p>${safe(order.records?.assembly||'Não registrada')}</p></article><article><span>Testes</span><p>${safe(order.records?.tests||'Não registrados')}</p></article></div><div class="history-photo-groups">${groups.map(([group,label])=>`<div><strong>${label}</strong><div class="history-photos">${(order.photos[group]||[]).map(photo=>annotatedPhoto(photo,'mini')).join('')||'<span>Sem fotos</span>'}</div></div>`).join('')}</div></div></details>`;
  }

  function orderDetailView(orderId) {
    const order=getOrder(orderId); if(!order) return notFoundView();
    order.records=order.records||{diagnosis:'',assembly:'',tests:'',conclusion:''};
    order.photos=order.photos||{before:[],during:[],assembly:[],after:[]};
    const client=getClient(order.clientId),eq=getEquipment(order.equipmentId),idx=stageIndex(order.stage),progress=Math.round((idx/(STAGES.length-1))*100),current=STAGES[idx],next=nextStageForOrder(order),requirements=stageRequirements(order),ready=requirements.every(item=>item.ok);
    const stairs=STAGES.map((stage,i)=>`<div class="workflow-step ${i<idx?'done':''} ${i===idx?'current':''} ${i>idx?'locked':''}" style="--step:${i}"><div class="workflow-step-top"><span>${i<idx?icon('check',15):i+1}</span><small>${stage.team}</small></div><strong>${stage.label}</strong><p>${stage.short}</p></div>`).join('');
    const primary=order.stage==='relatorio'?`<button class="btn btn-primary" data-action="open-report" data-id="${order.id}">${icon('file')} Abrir relatório</button>`:order.stage==='concluida'?`<button class="btn btn-success" disabled>${icon('check')} Processo concluído</button>`:`<button class="btn btn-primary ${ready?'':'btn-attention'}" data-action="advance-stage" data-id="${order.id}">${safe(handoffButtonLabelV5(order))} ${icon('arrow',16)}</button>`;
    const nextTeam=order.stage==='concluida'?null:next;
    const handoffs=(order.handoffs||[]).slice().reverse().map(item=>`<div class="handoff-item"><span>${icon('arrow',14)}</span><div><strong>${safe(item.fromTeam)} → ${safe(item.toTeam)}</strong><small>${formatDateTime(item.at)}</small></div></div>`).join('');
    return shell(`<div class="page">${pageHead(`OS ${safe(order.number)}`,`${safe(client?.name)} · ${safe(eq?.tag)} · ${safe(equipmentDescription(eq))}`,`<button class="btn btn-light" data-action="open-report" data-id="${order.id}">${icon('file')} Relatório</button>`)}<section class="workflow-card"><div class="workflow-title"><div><span>Fluxo guiado</span><h2>Uma equipe conclui e libera a próxima</h2></div>${badge(`${progress}% concluído`,progress===100?'green':'blue')}</div><div class="workflow-stair">${stairs}</div></section><section class="current-task"><div class="current-team"><small>AGORA COM</small><strong>${safe(current.team)}</strong><span>${safe(current.label)}</span></div><div class="task-body"><div><small>Conferência automática desta etapa</small><div class="requirement-list">${requirements.map(item=>`<div class="requirement ${item.ok?'ok':'pending'}"><span>${icon(item.ok?'check':'clock',16)}</span><strong>${safe(item.label)}</strong></div>`).join('')}</div></div><div class="next-team"><small>${nextTeam?'PRÓXIMA EQUIPE':'PROCESSO'}</small><strong>${nextTeam?safe(nextTeam.team):'Encerrado'}</strong><span>${nextTeam?safe(nextTeam.label):'Disponível ao cliente'}</span></div></div><div class="task-actions"><button class="btn btn-light" data-action="save-stage" data-id="${order.id}">${icon('save')} Salvar etapa</button>${primary}</div></section><section class="card os-identification"><div class="detail-hero"><div class="detail-field"><label>Cliente / TAG</label><strong>${safe(client?.name)} · ${safe(eq?.tag)}</strong></div><div class="detail-field"><label>Equipamento</label><strong>${safe(equipmentDescription(eq))}</strong></div><div class="detail-field"><label>Entrada / Prazo</label><strong>${formatDate(order.entryDate)}<br>${formatDate(order.dueDate)}</strong></div><div class="detail-field"><label>Defeito informado</label><strong>${safe(order.defect)}</strong></div></div></section>${currentStageWorkspace(order)}${orderHistoryV5(order)}<section class="card handoff-card"><div class="card-head"><h2>Passagens entre equipes</h2></div><div class="card-body handoff-list">${handoffs||'<div class="empty">Nenhuma passagem registrada.</div>'}</div></section></div>`,'workshop');
  }

  function saveStageData(order, notify=true) {
    if(!order) return;
    order.records=order.records||{diagnosis:'',assembly:'',tests:'',conclusion:''};
    if(order.stage==='entrada') {
      order.entryDate=document.getElementById('stage-entry-date')?.value||order.entryDate;
      order.dueDate=document.getElementById('stage-due-date')?.value||order.dueDate;
      order.defect=(document.getElementById('stage-defect')?.value||order.defect||'').trim();
      order.reception={...order.reception,receivedBy:(document.getElementById('stage-received-by')?.value||'').trim(),deliveryContact:(document.getElementById('stage-delivery-contact')?.value||'').trim(),condition:(document.getElementById('stage-condition')?.value||'').trim(),accessories:(document.getElementById('stage-accessories')?.value||'').trim()};
    }
    const record=document.getElementById('stage-record');
    if(record) {
      if(order.stage==='diagnostico') order.records.diagnosis=record.value.trim();
      if(order.stage==='montagem') order.records.assembly=record.value.trim();
      if(order.stage==='testes') order.records.tests=record.value.trim();
    }
    saveDB();
    if(notify) { addActivity(`Etapa ${stageLabel(order.stage)} da OS ${order.number} salva.`); saveDB(); render(); toast('Etapa salva.'); }
  }

  function advanceStage(orderId) {
    try {
      const order=getOrder(orderId); if(!order) throw new Error('OS não encontrada');
      saveStageData(order,false);
      const pending=stageRequirements(order).filter(item=>!item.ok);
      if(pending.length){saveDB();render();toast(`Etapa bloqueada: ${pending[0].label}.`,'error');return;}
      if(order.stage==='relatorio'){location.hash=`#reports/${order.id}`;return;}
      const from=STAGES.find(s=>s.id===order.stage),to=nextStageForOrder(order);
      if(!from||!to||from.id===to.id) return;
      order.handoffs=order.handoffs||[];
      order.handoffs.push({fromStage:from.id,toStage:to.id,fromTeam:from.team,toTeam:to.team,at:new Date().toISOString()});
      order.stage=to.id; order.availableSince=new Date().toISOString();
      addActivity(`OS ${order.number}: ${from.team} concluiu ${from.label} e liberou para ${to.team}.`);
      saveDB(); render(); toast(`Etapa concluída. OS disponível para ${to.team}.`);
    } catch(error) {
      console.error(error); toast(`Não foi possível avançar a OS: ${error.message}`,'error');
    }
  }

  function wizardSteps(activeStep) {
    const labels=['Identificação','Recebimento completo','Revisão'];
    return `<div class="wizard-steps wizard-steps-v5">${labels.map((label,index)=>{const step=index+1;return `<div class="wizard-step ${step<activeStep?'done':''} ${step===activeStep?'active':''}"><span>${step<activeStep?icon('check',15):step}</span><strong>${label}</strong></div>`}).join('')}</div>`;
  }

  function saveWizardFormLoose() {
    const form=document.getElementById('new-order-wizard');
    if(!form||!newOrderDraft) return;
    const data=Object.fromEntries(new FormData(form));
    Object.keys(data).forEach(key=>{if(key!=='receptionPhotos')newOrderDraft[key]=data[key]});
  }

  function newOrderModal(step=1,reset=false) {
    if(reset||!newOrderDraft) newOrderDraft={clientId:'',equipmentText:'',equipmentTag:'',equipmentSerial:'',entryDate:todayISO(),dueDate:'',receivedBy:'',deliveryContact:'',technician:'A definir',defect:'',condition:'',accessories:'',receptionPhotos:[]};
    newOrderDraft.receptionPhotos=(newOrderDraft.receptionPhotos||[]).map(p=>normalizePhotoV5(p,'Recebimento'));
    const number=nextOrderNumber(),client=getClient(newOrderDraft.clientId);
    const suggestions=[...new Set([...(db.equipment.filter(e=>e.clientId===newOrderDraft.clientId).map(e=>equipmentDescription(e))),...(db.catalog?.equipmentDescriptions||[]),...equipmentSuggestions()])];
    let content='';
    if(step===1) content=`<form id="new-order-wizard" data-step="1" class="form-grid"><div class="auto-number span-2"><small>Número automático</small><strong>OS ${number}</strong><span>Ninguém digita ou repete a numeração.</span></div><div class="form-group"><label>Cliente *</label><select class="select" name="clientId" required><option value="">Selecione</option>${db.clients.filter(c=>c.active).map(c=>`<option value="${c.id}" ${newOrderDraft.clientId===c.id?'selected':''}>${safe(c.name)}</option>`).join('')}</select></div><div class="form-group"><label>Equipamento *</label><input class="input equipment-main-input" name="equipmentText" list="equipment-description-list" value="${safe(newOrderDraft.equipmentText)}" required autocomplete="off" placeholder="Ex.: Motor WEG 3 cv"><datalist id="equipment-description-list">${suggestions.map(item=>`<option value="${safe(item)}"></option>`).join('')}</datalist></div><div class="equipment-entry-hint span-2">${icon('check',16)}<span>Digite normalmente. Se já existir para o cliente, será reutilizado; se for novo, ficará salvo como sugestão.</span></div><details class="optional-details span-2" ${newOrderDraft.equipmentTag||newOrderDraft.equipmentSerial?'open':''}><summary>TAG e número de série - opcionais</summary><div class="form-grid optional-details-body"><div class="form-group"><label>TAG</label><input class="input" name="equipmentTag" value="${safe(newOrderDraft.equipmentTag)}"></div><div class="form-group"><label>Número de série</label><input class="input" name="equipmentSerial" value="${safe(newOrderDraft.equipmentSerial)}"></div></div></details></form>`;
    if(step===2) content=`<form id="new-order-wizard" data-step="2" class="form-grid"><div class="selection-summary span-2"><span>OS ${number}</span><strong>${safe(client?.name)} · ${safe(newOrderDraft.equipmentText)}</strong></div><div class="form-section span-2"><strong>Recebimento completo</strong><p>Preencha tudo aqui, inclusive as fotos. Ao finalizar, a OS será liberada diretamente para a Oficina.</p></div><div class="form-group"><label>Data de entrada *</label><input class="input" type="date" name="entryDate" value="${safe(newOrderDraft.entryDate)}" required></div><div class="form-group"><label>Prazo previsto *</label><input class="input" type="date" name="dueDate" min="${safe(newOrderDraft.entryDate)}" value="${safe(newOrderDraft.dueDate)}" required></div><div class="form-group"><label>Recebido por *</label><input class="input" name="receivedBy" value="${safe(newOrderDraft.receivedBy)}" required></div><div class="form-group"><label>Contato de quem entregou</label><input class="input" name="deliveryContact" value="${safe(newOrderDraft.deliveryContact)}"></div><div class="form-group span-2"><label>Defeito informado pelo cliente *</label><textarea class="textarea" name="defect" required>${safe(newOrderDraft.defect)}</textarea></div><div class="form-group span-2"><label>Condição no recebimento</label><textarea class="textarea" name="condition" placeholder="Danos, sujeira, eixo travado, caixa de ligação...">${safe(newOrderDraft.condition)}</textarea></div><div class="form-group span-2"><label>Acessórios recebidos</label><input class="input" name="accessories" value="${safe(newOrderDraft.accessories)}" placeholder="Acoplamento, base, tampa, cabos..."></div><div class="form-group span-2"><label>Técnico inicial</label><input class="input" name="technician" value="${safe(newOrderDraft.technician)}"></div><div class="form-group span-2"><label>Fotos do recebimento *</label><div class="wizard-photo-actions-v201"><label class="wizard-photo-upload">${icon('camera',25)}<strong>Tirar foto</strong><span>Abre a câmera traseira do tablet/celular.</span><input type="file" accept="image/*" capture="environment" hidden data-action="wizard-photo-upload"></label><label class="wizard-photo-upload gallery-v201">${icon('file',25)}<strong>Escolher da galeria</strong><span>Selecione uma ou várias fotos já salvas.</span><input type="file" accept="image/*" multiple hidden data-action="wizard-photo-upload"></label></div><small class="photo-compress-note-v201">Fotos grandes são redimensionadas e compactadas automaticamente antes de salvar.</small><div class="wizard-photo-grid">${newOrderDraft.receptionPhotos.map((photo,index)=>`<div class="wizard-photo-item">${annotatedPhoto(photo)}<button type="button" data-action="delete-wizard-photo" data-index="${index}">×</button></div>`).join('')||'<div class="wizard-no-photo">Nenhuma foto adicionada.</div>'}</div></div></form>`;
    if(step===3) content=`<div class="wizard-review"><div class="review-title">${icon('check',22)} Confira o recebimento</div><div class="review-grid"><div><span>Número</span><strong>OS ${number}</strong></div><div><span>Cliente</span><strong>${safe(client?.name)}</strong></div><div class="wide"><span>Equipamento</span><strong>${safe(newOrderDraft.equipmentText)}</strong></div><div><span>Entrada / Prazo</span><strong>${formatDate(newOrderDraft.entryDate)} · ${formatDate(newOrderDraft.dueDate)}</strong></div><div><span>Recebido por</span><strong>${safe(newOrderDraft.receivedBy)}</strong></div><div class="wide"><span>Defeito informado</span><strong>${safe(newOrderDraft.defect)}</strong></div><div class="wide"><span>Fotos</span><strong>${newOrderDraft.receptionPhotos.length} foto(s) de recebimento</strong></div></div><div class="handoff-preview"><span>Ao confirmar</span><strong>A Recepção será concluída e a OS ficará disponível para Diagnóstico</strong><small>Não será necessário abrir outra tela para completar o recebimento.</small></div></div>`;
    const footer=`<button class="btn btn-light" data-action="close-modal">Cancelar</button>${step>1?`<button class="btn btn-light" data-action="wizard-back" data-step="${step}">Voltar</button>`:''}${step<3?`<button class="btn btn-primary" data-action="wizard-next" data-step="${step}">Próximo ${icon('arrow',16)}</button>`:`<button class="btn btn-primary" data-action="submit-new-order">${icon('save')} Gerar OS e liberar Oficina</button>`}`;
    openModal('Nova ordem de serviço',`${wizardSteps(step)}${content}`,footer);
  }

  function collectWizardStep(step) {
    const form=document.getElementById('new-order-wizard');
    if(!form||!form.reportValidity()) return false;
    const data=Object.fromEntries(new FormData(form)); Object.assign(newOrderDraft,data);
    if(step===2){
      if(newOrderDraft.dueDate<newOrderDraft.entryDate){toast('O prazo não pode ser anterior à entrada.','error');return false;}
      if((newOrderDraft.receptionPhotos||[]).length===0){toast('Adicione pelo menos uma foto no recebimento.','error');return false;}
    }
    return true;
  }

  async function submitNewOrder() {
    if(!newOrderDraft) return toast('O cadastro expirou. Inicie novamente.','error');
    const client=getClient(newOrderDraft.clientId); if(!client) return toast('Cliente inválido.','error');
    const typed=String(newOrderDraft.equipmentText||'').trim().replace(/\s+/g,' '); if(!typed) return toast('Informe o equipamento.','error');
    let eq=db.equipment.find(item=>item.clientId===client.id&&equipmentDescription(item).toLocaleLowerCase('pt-BR')===typed.toLocaleLowerCase('pt-BR'));
    if(eq){if(newOrderDraft.equipmentTag&&(!eq.tag||/^EQ-/.test(eq.tag)))eq.tag=newOrderDraft.equipmentTag.trim();if(newOrderDraft.equipmentSerial&&!eq.serial)eq.serial=newOrderDraft.equipmentSerial.trim();}
    else {const parsed=parseEquipmentDescription(typed);eq={id:id('e'),clientId:client.id,tag:newOrderDraft.equipmentTag?.trim()||nextEquipmentCode(),description:parsed.description,type:parsed.type,manufacturer:parsed.manufacturer,model:parsed.model,power:parsed.power,serial:newOrderDraft.equipmentSerial?.trim()||''};db.equipment.push(eq);rememberEquipmentDescription(eq.description);}
    const now=new Date().toISOString();
    const order={id:id('o'),number:nextOrderNumber(),clientId:client.id,equipmentId:eq.id,entryDate:newOrderDraft.entryDate,dueDate:newOrderDraft.dueDate,stage:'diagnostico',defect:newOrderDraft.defect.trim(),technician:newOrderDraft.technician||'A definir',supervisor:'A definir',notes:'',records:{diagnosis:'',assembly:'',tests:'',conclusion:''},noPartsRequired:false,createdAt:now,availableSince:now,handoffs:[{fromStage:'entrada',toStage:'diagnostico',fromTeam:'Recepção',toTeam:'Oficina',at:now}],reception:{receivedBy:newOrderDraft.receivedBy.trim(),deliveryContact:(newOrderDraft.deliveryContact||'').trim(),condition:(newOrderDraft.condition||'').trim(),accessories:(newOrderDraft.accessories||'').trim()},parts:[],measurements:[],photos:{before:newOrderDraft.receptionPhotos.map(p=>normalizePhotoV5(p,'Recebimento')),during:[],assembly:[],after:[]},report:{approved:false,sent:false,scheduledAt:'',sentAt:'',recipient:client.email}};
    db.orders.unshift(order);addActivity(`OS ${order.number}: recebimento concluído e liberado para Diagnóstico.`);saveDB();newOrderDraft=null;closeModal();location.hash=`#order/${order.id}`;toast(`OS ${order.number} criada e disponível para a Oficina.`);
  }

  async function handleWizardPhotoUpload(input) {
    saveWizardFormLoose();
    const files=[...input.files].slice(0,8);
    let added=0;
    for(const file of files){
      try{newOrderDraft.receptionPhotos.push(await fileToPhoto(file,'Recebimento'));added++;}
      catch(error){toast(error?.message||`Não foi possível processar ${file.name}.`,'error');}
    }
    input.value='';
    newOrderModal(2);
    if(added) toast(`${added} foto(s) adicionada(s) e compactada(s) automaticamente.`);
  }

  async function handlePhotoUpload(input) {
    const order=getOrder(input.dataset.order),group=input.dataset.group; if(!order) return;
    saveStageData(order,false);
    order.photos[group]=order.photos[group]||[];
    const files=[...input.files].slice(0,8);
    let added=0;
    for(const file of files){
      try{order.photos[group].push(await fileToPhoto(file,({before:'Recebimento',during:'Diagnóstico',assembly:'Montagem',after:'Finalização'})[group]||''));added++;}
      catch(error){toast(error?.message||`Não foi possível processar ${file.name}.`,'error');}
    }
    input.value='';
    if(added){saveDB();render();toast(`${added} foto(s) adicionada(s) e compactada(s) automaticamente.`);}
  }

  function openPhotoEditor(orderId,group,index) {
    const order=getOrder(orderId),photo=order?.photos?.[group]?.[Number(index)]; if(!photo) return;
    const normalized=normalizePhotoV5(photo); order.photos[group][Number(index)]=normalized;
    arrowEditorState={orderId,group,index:Number(index),annotations:normalized.annotations.map(a=>({...a})),caption:normalized.caption||'',color:'#c9202f',width:6,drawing:null};
    openModal('Editar foto e adicionar setas',`<div class="annotation-editor"><div class="annotation-toolbar"><label>Cor <input type="color" id="arrow-color" value="#c9202f"></label><label>Espessura <input type="range" id="arrow-width" min="2" max="12" value="6"></label><button class="btn btn-light btn-sm" data-action="undo-arrow">Desfazer</button><button class="btn btn-light btn-sm" data-action="clear-arrows">Limpar setas</button></div><div class="annotation-canvas" id="annotation-canvas" style="aspect-ratio:${normalized.width}/${normalized.height}"><img src="${safe(normalized.src)}" alt="Foto para anotação" draggable="false"><svg id="annotation-svg" viewBox="0 0 1000 1000" preserveAspectRatio="none"></svg></div><div class="form-group"><label>Legenda da foto</label><input class="input" id="photo-caption" value="${safe(normalized.caption)}" placeholder="Ex.: Folga encontrada no mancal dianteiro"></div><p class="annotation-help">Arraste o dedo ou mouse sobre a foto no sentido da seta.</p></div>`,`<button class="btn btn-light" data-action="close-modal">Cancelar</button><button class="btn btn-primary" data-action="save-photo-annotations">${icon('save')} Salvar foto</button>`);
    updateArrowEditorSvg();
  }

  function updateArrowEditorSvg() {
    const svg=document.getElementById('annotation-svg'); if(!svg||!arrowEditorState)return;
    const all=[...arrowEditorState.annotations]; if(arrowEditorState.drawing)all.push(arrowEditorState.drawing);
    svg.innerHTML=all.map(arrowMarkup).join('');
  }

  function pointerPosition(event) {
    const canvas=document.getElementById('annotation-canvas'); if(!canvas)return null;
    const rect=canvas.getBoundingClientRect(); return {x:Math.max(0,Math.min(1000,(event.clientX-rect.left)/rect.width*1000)),y:Math.max(0,Math.min(1000,(event.clientY-rect.top)/rect.height*1000))};
  }
  function handleAnnotationPointerDown(event){if(!arrowEditorState||!event.target.closest('#annotation-canvas'))return;const point=pointerPosition(event);if(!point)return;arrowEditorState.drawing={x1:point.x,y1:point.y,x2:point.x,y2:point.y,color:document.getElementById('arrow-color')?.value||arrowEditorState.color,width:Number(document.getElementById('arrow-width')?.value)||arrowEditorState.width};event.preventDefault();}
  function handleAnnotationPointerMove(event){if(!arrowEditorState?.drawing)return;const point=pointerPosition(event);if(!point)return;arrowEditorState.drawing.x2=point.x;arrowEditorState.drawing.y2=point.y;updateArrowEditorSvg();event.preventDefault();}
  function handleAnnotationPointerUp(event){if(!arrowEditorState?.drawing)return;const drawing=arrowEditorState.drawing;arrowEditorState.drawing=null;if(Math.hypot(drawing.x2-drawing.x1,drawing.y2-drawing.y1)>25)arrowEditorState.annotations.push(drawing);updateArrowEditorSvg();event.preventDefault();}

  function savePhotoAnnotations() {
    const state=arrowEditorState,order=getOrder(state?.orderId),photo=order?.photos?.[state.group]?.[state.index]; if(!photo)return;
    photo.annotations=state.annotations.map(a=>({...a})); photo.caption=(document.getElementById('photo-caption')?.value||'').trim(); saveDB(); arrowEditorState=null; closeModal(); render(); toast('Setas e legenda salvas.');
  }

  function clientStats(client) {
    const equipment=db.equipment.filter(e=>e.clientId===client.id),orders=db.orders.filter(o=>o.clientId===client.id),open=orders.filter(o=>o.stage!=='concluida'),reports=orders.filter(o=>o.report?.sent);
    return {equipment,orders,open,reports};
  }

  function clientsView() {
    const active=db.clients.filter(c=>c.active).length,totalEquipment=db.equipment.length,totalOpen=db.orders.filter(o=>o.stage!=='concluida').length;
    const cards=db.clients.map(client=>{const stats=clientStats(client),last=[...stats.orders].sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')))[0];return `<article class="client-card" data-client-name="${safe(client.name.toLowerCase())}"><div class="client-card-top"><div class="client-avatar">${safe(client.name.slice(0,2).toUpperCase())}</div><div><h3>${safe(client.name)}</h3><p>${safe(client.cnpj||'CNPJ não informado')}</p></div>${badge(client.active?'Ativo':'Inativo',client.active?'green':'gray')}</div><div class="client-contact-grid"><span>${icon('users',15)} ${safe(client.contact||'Sem contato')}</span><span>☎ ${safe(client.phone||'Sem telefone')}</span><span>✉ ${safe(client.email||'Sem e-mail')}</span><span>⌖ ${safe([client.city,client.state].filter(Boolean).join(' - ')||'Local não informado')}</span></div><div class="client-numbers"><div><strong>${stats.equipment.length}</strong><span>Equipamentos</span></div><div><strong>${stats.open.length}</strong><span>OS abertas</span></div><div><strong>${stats.reports.length}</strong><span>Relatórios</span></div></div><div class="client-card-foot"><small>${last?`Última OS: #${safe(last.number)} - ${stageLabel(last.stage)}`:'Nenhuma OS registrada'}</small><div class="row-actions"><button class="btn btn-light btn-sm" data-action="edit-client" data-id="${client.id}">${icon('edit',14)} Editar</button><button class="btn btn-primary btn-sm" data-action="open-client" data-id="${client.id}">Abrir cliente ${icon('arrow',14)}</button></div></div></article>`}).join('');
    return shell(`<div class="page">${pageHead('Clientes','Contatos, equipamentos, ordens e relatórios em uma visão única.',`<button class="btn btn-primary" data-action="new-client">${icon('plus')} Novo cliente</button>`)}<div class="grid client-kpis">${kpi(db.clients.length,'Clientes cadastrados','users','bg-blue')}${kpi(active,'Clientes ativos','check','bg-green')}${kpi(totalEquipment,'Equipamentos','motor','bg-purple')}${kpi(totalOpen,'OS em andamento','tools','bg-amber')}</div><section class="card client-search-card"><div class="card-body"><div class="filters"><div class="search"><input class="input" id="client-search" placeholder="Pesquisar cliente, contato ou cidade"></div></div></div></section><div class="client-cards" id="client-cards">${cards||'<div class="empty">Nenhum cliente cadastrado.</div>'}</div></div>`,'clients');
  }

  function clientDetailView(clientId) {
    const client=getClient(clientId);if(!client)return notFoundView();const stats=clientStats(client);
    const equipmentRows=stats.equipment.map(eq=>`<tr><td><strong>${safe(eq.tag)}</strong></td><td>${safe(equipmentDescription(eq))}</td><td>${safe(eq.serial||'—')}</td><td>${stats.orders.filter(o=>o.equipmentId===eq.id).length}</td></tr>`).join('');
    const orderRows=stats.orders.map(order=>`<tr><td><a class="table-link" href="#order/${order.id}">#${safe(order.number)}</a></td><td>${safe(equipmentDescription(getEquipment(order.equipmentId)))}</td><td>${badge(stageLabel(order.stage),stageTone(order.stage))}</td><td>${formatDate(order.dueDate)}</td><td><button class="btn btn-light btn-sm" data-action="open-order" data-id="${order.id}">Abrir</button></td></tr>`).join('');
    return shell(`<div class="page">${pageHead(safe(client.name),'Cadastro completo e histórico operacional.',`<button class="btn btn-light" data-action="edit-client" data-id="${client.id}">${icon('edit')} Editar cliente</button><button class="btn btn-primary" data-action="new-order">${icon('plus')} Nova OS</button>`)}<section class="client-profile card"><div class="client-profile-main"><div class="client-avatar large">${safe(client.name.slice(0,2).toUpperCase())}</div><div><h2>${safe(client.name)}</h2><p>${safe(client.cnpj||'CNPJ não informado')}</p><div class="client-profile-tags">${badge(client.active?'Ativo':'Inativo',client.active?'green':'gray')}${client.city?badge(`${client.city}${client.state?' - '+client.state:''}`,'gray'):''}</div></div></div><div class="client-profile-contact"><div><span>Contato principal</span><strong>${safe(client.contact||'—')}</strong></div><div><span>Telefone</span><strong>${safe(client.phone||'—')}</strong></div><div><span>E-mail</span><strong>${safe(client.email||'—')}</strong></div><div><span>Endereço</span><strong>${safe(client.address||'—')}</strong></div></div></section><div class="grid client-detail-kpis">${kpi(stats.equipment.length,'Equipamentos','motor','bg-blue')}${kpi(stats.open.length,'OS abertas','clipboard','bg-amber')}${kpi(stats.orders.length,'OS total','tools','bg-purple')}${kpi(stats.reports.length,'Relatórios enviados','file','bg-green')}</div><div class="grid client-detail-layout"><section class="card"><div class="card-head"><h2>Equipamentos do cliente</h2></div><div class="table-wrap"><table class="table"><thead><tr><th>TAG</th><th>Descrição</th><th>Série</th><th>OS</th></tr></thead><tbody>${equipmentRows||'<tr><td colspan="4"><div class="empty">Nenhum equipamento.</div></td></tr>'}</tbody></table></div></section><section class="card"><div class="card-head"><h2>Ordens de serviço</h2></div><div class="table-wrap"><table class="table"><thead><tr><th>OS</th><th>Equipamento</th><th>Etapa</th><th>Prazo</th><th></th></tr></thead><tbody>${orderRows||'<tr><td colspan="5"><div class="empty">Nenhuma OS.</div></td></tr>'}</tbody></table></div></section></div>${client.notes?`<section class="card"><div class="card-head"><h2>Observações do cliente</h2></div><div class="card-body"><p>${safe(client.notes)}</p></div></section>`:''}</div>`,'clients');
  }

  function clientModal(clientId='') {
    const client=clientId?getClient(clientId):{id:'',name:'',cnpj:'',contact:'',phone:'',email:'',address:'',city:'',state:'',notes:'',active:true};
    openModal(clientId?'Editar cliente':'Novo cliente',`<form id="new-client-form" class="form-grid"><input type="hidden" name="id" value="${safe(client.id)}"><div class="form-group span-2"><label>Razão social / nome *</label><input class="input" name="name" value="${safe(client.name)}" required></div><div class="form-group"><label>CNPJ</label><input class="input" name="cnpj" value="${safe(client.cnpj)}" placeholder="00.000.000/0000-00"></div><div class="form-group"><label>Contato principal</label><input class="input" name="contact" value="${safe(client.contact)}"></div><div class="form-group"><label>Telefone</label><input class="input" name="phone" value="${safe(client.phone)}"></div><div class="form-group"><label>E-mail *</label><input class="input" type="email" name="email" value="${safe(client.email)}" required></div><div class="form-group span-2"><label>Endereço</label><input class="input" name="address" value="${safe(client.address)}"></div><div class="form-group"><label>Cidade</label><input class="input" name="city" value="${safe(client.city)}"></div><div class="form-group"><label>Estado</label><input class="input" name="state" value="${safe(client.state)}" maxlength="2"></div><div class="form-group span-2"><label>Observações</label><textarea class="textarea" name="notes">${safe(client.notes)}</textarea></div></form>`,`<button class="btn btn-light" data-action="close-modal">Cancelar</button><button class="btn btn-primary" data-action="submit-client">${icon('save')} Salvar cliente</button>`);
  }
  function newClientModal(){clientModal('');}
  function submitClient(){const form=document.getElementById('new-client-form');if(!form?.reportValidity())return;const data=Object.fromEntries(new FormData(form));let client=data.id?getClient(data.id):null;if(client)Object.assign(client,data);else{client={...data,id:id('c'),active:true};db.clients.push(client);}saveDB();closeModal();render();toast(data.id?'Cliente atualizado.':'Cliente cadastrado.');}

  function reportChecklist(order) {
    const records=order.records||{};
    const totalPhotos=['before','during','assembly','after'].reduce((n,g)=>n+(order.photos[g]||[]).length,0);
    return [
      {label:'Conclusão técnica',ok:Boolean(records.conclusion?.trim().length>=10),detail:records.conclusion?'Preenchida':'Preencha a conclusão'},
      {label:'Medições e testes',ok:(order.measurements||[]).length>0,detail:`${(order.measurements||[]).length} registro(s)`},
      {label:'Peças utilizadas',ok:order.noPartsRequired||(order.parts||[]).length>0,detail:order.noPartsRequired?'Sem peças':`${(order.parts||[]).length} item(ns)`},
      {label:'Fotos do recebimento',ok:(order.photos.before||[]).length>0,detail:`${(order.photos.before||[]).length} foto(s)`},
      {label:'Fotos da execução e finalização',ok:(order.photos.assembly||[]).length>0&&(order.photos.after||[]).length>0,detail:`${totalPhotos} foto(s) no total`},
      {label:'Destinatário do e-mail',ok:Boolean(order.report?.recipient),detail:order.report?.recipient||'Não informado'}
    ];
  }
  function reportReady(order){return reportChecklist(order).every(item=>item.ok);}

  function reportPhotoSection(title,photos,orderNumber='') {
    if(!photos.length)return '';
    const pages=[];
    for(let start=0;start<photos.length;start+=4) pages.push(photos.slice(start,start+4));
    return pages.map((page,pageIndex)=>`<section class="report-page"><div class="report-page-header"><img src="./assets/ar7-logo.png" alt="AR7"><div><span>RELATÓRIO TÉCNICO</span><strong>${safe(title)}${pages.length>1?` - ${pageIndex+1}/${pages.length}`:''}</strong></div></div><div class="report-photo-grid">${page.map((photo,index)=>`<figure>${annotatedPhoto(photo,'report-annotated')}<figcaption>${safe(photo.caption||`${title} - foto ${pageIndex*4+index+1}`)}</figcaption></figure>`).join('')}</div><div class="report-footer"><span>AR7 Elétrica</span><span>Evidências fotográficas</span></div></section>`).join('');
  }
  function reportPageCount(order) {
    return 3+['before','during','assembly','after'].reduce((total,group)=>total+Math.ceil((order.photos?.[group]?.length||0)/4),0);
  }

  function reportDocumentV5(order) {
    const client=getClient(order.clientId),eq=getEquipment(order.equipmentId),records=order.records||{};
    const hero=(order.photos.after||[])[0]||(order.photos.before||[])[0];
    const measurements=(order.measurements||[]).map(m=>`<tr><td>${safe(m.name)}</td><td>${safe(m.unit)}</td><td>${safe(m.before)}</td><td>${safe(m.after)}</td><td>${safe(m.limit)}</td><td>${safe(m.status||'Registrado')}</td></tr>`).join('');
    const parts=(order.parts||[]).map(p=>`<tr><td>${safe(p.name)}</td><td>${safe(p.position||'—')}</td><td>${safe(p.code||'—')}</td><td>${safe(p.dimensions||'—')}</td><td>${safe(partQuantity(p))}</td></tr>`).join('');
    return `<div class="report-document" id="printable-report"><section class="report-page report-cover"><div class="cover-brand"><img src="./assets/ar7-logo.png" alt="AR7 Elétrica"></div><div class="cover-title"><span>RELATÓRIO TÉCNICO DE MANUTENÇÃO</span><h1>OS ${safe(order.number)}</h1><p>${safe(equipmentDescription(eq))}</p></div>${hero?annotatedPhoto(hero,'cover-photo','Equipamento'):''}<div class="cover-data"><div><span>Cliente</span><strong>${safe(client?.name)}</strong></div><div><span>TAG / Série</span><strong>${safe(eq?.tag)} · ${safe(eq?.serial||'Não informada')}</strong></div><div><span>Entrada</span><strong>${formatDate(order.entryDate)}</strong></div><div><span>Conclusão prevista</span><strong>${formatDate(order.dueDate)}</strong></div></div><div class="report-footer"><span>AR7 Elétrica</span><span>Relatório gerado em ${new Intl.DateTimeFormat('pt-BR').format(new Date())}</span></div></section><section class="report-page"><div class="report-page-header"><img src="./assets/ar7-logo.png" alt="AR7"><div><span>OS ${safe(order.number)}</span><strong>Identificação e histórico técnico</strong></div></div><div class="report-info-grid"><article><span>Cliente</span><strong>${safe(client?.name)}</strong><p>${safe(client?.contact||'')} · ${safe(client?.email||'')}</p></article><article><span>Equipamento</span><strong>${safe(equipmentDescription(eq))}</strong><p>${safe(eq?.tag)} · ${safe(eq?.serial||'Sem série')}</p></article><article><span>Defeito informado</span><p>${safe(order.defect)}</p></article><article><span>Condição no recebimento</span><p>${safe(order.reception?.condition||'Não informada')}</p></article></div><div class="report-text-section"><h2>Diagnóstico técnico</h2><p>${safe(records.diagnosis||'Não registrado')}</p></div><div class="report-text-section"><h2>Serviços de montagem</h2><p>${safe(records.assembly||'Não registrados')}</p></div><div class="report-text-section"><h2>Testes finais</h2><p>${safe(records.tests||'Não registrados')}</p></div><div class="report-text-section conclusion"><h2>Conclusão técnica</h2><p>${safe(records.conclusion||'Pendente')}</p></div><div class="report-footer"><span>AR7 Elétrica</span><span>Histórico técnico</span></div></section><section class="report-page"><div class="report-page-header"><img src="./assets/ar7-logo.png" alt="AR7"><div><span>OS ${safe(order.number)}</span><strong>Peças, medições e resultados</strong></div></div><h2 class="report-section-title">Peças utilizadas</h2><table class="report-table"><thead><tr><th>Peça</th><th>Aplicação</th><th>Código</th><th>Medidas</th><th>Quantidade</th></tr></thead><tbody>${parts||'<tr><td colspan="5">Serviço sem peças registradas.</td></tr>'}</tbody></table><h2 class="report-section-title">Medições e testes</h2><table class="report-table"><thead><tr><th>Parâmetro</th><th>Unidade</th><th>Antes</th><th>Depois</th><th>Limite</th></tr></thead><tbody>${measurements||'<tr><td colspan="6">Nenhuma medição registrada.</td></tr>'}</tbody></table><div class="report-signatures"><div><span>Responsável técnico</span><strong>${safe(order.technician||'A definir')}</strong></div><div><span>Supervisor / aprovação</span><strong>${safe(order.supervisor||'A definir')}</strong></div></div><div class="report-footer"><span>AR7 Elétrica</span><span>Peças e medições</span></div></section>${reportPhotoSection('Recebimento',order.photos.before||[],order.number)}${reportPhotoSection('Diagnóstico e desmontagem',order.photos.during||[],order.number)}${reportPhotoSection('Montagem',order.photos.assembly||[],order.number)}${reportPhotoSection('Equipamento finalizado',order.photos.after||[],order.number)}</div>`;
  }

  function reportDetailView(orderId) {
    const order=getOrder(orderId);if(!order)return notFoundView();order.records=order.records||{diagnosis:'',assembly:'',tests:'',conclusion:''};
    const checks=reportChecklist(order),ready=reportReady(order);
    return shell(`<div class="page">${pageHead('Gerador de Relatório Técnico','Documento completo em páginas, com fotos, setas, peças e medições.',`<button class="btn btn-light" data-action="save-report-data" data-id="${order.id}">${icon('save')} Salvar</button><button class="btn btn-primary" data-action="print-report" data-id="${order.id}">${icon('download')} Gerar / salvar PDF</button>`)}<div class="grid report-layout-v5"><aside class="stack"><section class="card"><div class="card-head"><h2>Finalização do relatório</h2></div><div class="card-body stack"><div class="form-group"><label>Conclusão técnica *</label><textarea class="textarea" id="report-conclusion" placeholder="Conclusão final, condição do equipamento e recomendações...">${safe(order.records.conclusion||'')}</textarea></div><div class="form-group"><label>Destinatário</label><input class="input" id="report-recipient" type="email" value="${safe(order.report.recipient||'')}"></div><div class="form-group"><label>Supervisor</label><input class="input" id="report-supervisor" value="${safe(order.supervisor||'')}"></div></div></section><section class="card"><div class="card-head"><h2>Checklist de qualidade</h2></div><div class="card-body alert-list">${checks.map(c=>`<div class="alert-item"><div class="alert-icon ${c.ok?'tone-blue':'tone-red'}">${icon(c.ok?'check':'alert',16)}</div><div><strong>${safe(c.label)}</strong><p>${safe(c.detail)}</p></div></div>`).join('')}</div></section><section class="card"><div class="card-body stack"><button class="btn ${(ready||order.report.approved)?'btn-success':'btn-light readiness-pending-v202'}" data-action="approve-report" data-id="${order.id}" ${order.report.approved||!ready?'disabled':''}>${icon((ready||order.report.approved)?'check':'clock')} ${order.report.approved?'Relatório aprovado':ready?'Pronto: aprovar relatório':'Concluir checklist para aprovar'}</button><button class="btn ${order.report.approved?'btn-success':'btn-light readiness-pending-v202'}" data-action="send-report" data-id="${order.id}" ${!order.report.approved?'disabled':''}>${icon(order.report.approved?'send':'clock')} ${order.report.approved?'Pronto: enviar ao cliente':'Aguardando aprovação do relatório'}</button><div class="form-group"><label>Agendar envio</label><input class="input" type="datetime-local" id="schedule-at" value="${order.report.scheduledAt||''}"><button class="btn btn-light" data-action="schedule-report" data-id="${order.id}" style="width:100%;margin-top:8px">${icon('clock')} Agendar</button></div></div></section></aside><section class="pdf-shell pdf-shell-v5"><div class="pdf-toolbar"><span>${icon('file',17)}</span><span>Relatorio_AR7_OS_${safe(order.number)}.pdf</span><span style="margin-left:auto">${reportPageCount(order)} páginas</span></div>${reportDocumentV5(order)}</section></div></div>`,'reports');
  }

  function saveReportData(orderId,notify=true){const order=getOrder(orderId);if(!order)return;order.records=order.records||{};order.records.conclusion=(document.getElementById('report-conclusion')?.value||order.records.conclusion||'').trim();order.report.recipient=(document.getElementById('report-recipient')?.value||order.report.recipient||'').trim();order.supervisor=(document.getElementById('report-supervisor')?.value||order.supervisor||'').trim();saveDB();if(notify){render();toast('Dados do relatório salvos.');}}

  function render() {
    const {route,param}=parseRoute();
    const views={dashboard:dashboardView,orders:ordersView,clients:clientsView,client:()=>clientDetailView(param),equipment:equipmentView,parts:partsView,workshop:workshopView,reports:()=>reportsView(param),portal:portalView,settings:settingsView,order:()=>orderDetailView(param)};
    try { document.getElementById('app').innerHTML=(views[route]||notFoundView)(); window.scrollTo(0,0); }
    catch(error){console.error('Falha ao renderizar',error);document.getElementById('app').innerHTML=`<div class="fatal-error"><h1>Não foi possível abrir esta tela</h1><p>${safe(error.message)}</p><button class="btn btn-primary" onclick="location.hash='#dashboard';location.reload()">Voltar ao dashboard</button></div>`;}
  }

  async function handleClick(event) {
    const target=event.target.closest('[data-action]');if(!target)return;const action=target.dataset.action;
    try {
      if(action==='toggle-menu'){const sidebar=document.getElementById('sidebar'),overlay=document.getElementById('sidebar-overlay');sidebar.classList.toggle('open');overlay.hidden=!sidebar.classList.contains('open');return;}
      if(action==='close-modal'){arrowEditorState=null;closeModal();return;}
      if(action==='new-order'){newOrderModal(1,true);return;}
      if(action==='wizard-next'){const step=Number(target.dataset.step);if(collectWizardStep(step))newOrderModal(step+1);return;}
      if(action==='wizard-back'){saveWizardFormLoose();newOrderModal(Math.max(1,Number(target.dataset.step)-1));return;}
      if(action==='delete-wizard-photo'){saveWizardFormLoose();newOrderDraft.receptionPhotos.splice(Number(target.dataset.index),1);newOrderModal(2);return;}
      if(action==='new-client'){newClientModal();return;}
      if(action==='edit-client'){clientModal(target.dataset.id);return;}
      if(action==='open-client'){location.hash=`#client/${target.dataset.id}`;return;}
      if(action==='new-equipment'){newEquipmentModal();return;}
      if(action==='open-order'){location.hash=`#order/${target.dataset.id}`;return;}
      if(action==='open-report'){location.hash=`#reports/${target.dataset.id}`;return;}
      if(action==='add-part'){saveStageData(getOrder(target.dataset.id),false);addPartModal(target.dataset.id);return;}
      if(action==='edit-purchase'){purchaseModal(target.dataset.order,target.dataset.part);return;}
      if(action==='add-measurement'){saveStageData(getOrder(target.dataset.id),false);addMeasurementModal(target.dataset.id);return;}
      if(action==='toggle-no-parts'){const order=getOrder(target.dataset.id);saveStageData(order,false);order.noPartsRequired=!order.noPartsRequired;saveDB();render();toast(order.noPartsRequired?'Marcado: não precisa de peças.':'Marcação removida.');return;}
      if(action==='new-part-global'){addPartModal();return;}
      if(action==='submit-new-order'){await submitNewOrder();return;}
      if(action==='submit-part'){await submitPart();return;}
      if(action==='submit-purchase'){submitPurchase();return;}
      if(action==='submit-measurement'){submitMeasurement();return;}
      if(action==='submit-client'){submitClient();return;}
      if(action==='submit-equipment'){submitEquipment();return;}
      if(action==='save-stage'){saveStageData(getOrder(target.dataset.id),true);return;}
      if(action==='advance-stage'){advanceStage(target.dataset.id);return;}
      if(action==='advance-part'){advancePart(target.dataset.order,target.dataset.part);return;}
      if(action==='delete-photo'){const order=getOrder(target.dataset.order);saveStageData(order,false);order.photos[target.dataset.group].splice(Number(target.dataset.index),1);saveDB();render();toast('Foto removida.');return;}
      if(action==='edit-photo'){saveStageData(getOrder(target.dataset.order),false);openPhotoEditor(target.dataset.order,target.dataset.group,target.dataset.index);return;}
      if(action==='undo-arrow'){arrowEditorState?.annotations.pop();updateArrowEditorSvg();return;}
      if(action==='clear-arrows'){if(arrowEditorState){arrowEditorState.annotations=[];updateArrowEditorSvg();}return;}
      if(action==='save-photo-annotations'){savePhotoAnnotations();return;}
      if(action==='save-report-data'){saveReportData(target.dataset.id,true);return;}
      if(action==='approve-report'){saveReportData(target.dataset.id,false);approveReport(target.dataset.id);return;}
      if(action==='send-report'){saveReportData(target.dataset.id,false);sendReport(target.dataset.id);return;}
      if(action==='schedule-report'){scheduleReport(target.dataset.id);return;}
      if(action==='print-report'){saveReportData(target.dataset.id,false);render();setTimeout(()=>window.print(),80);return;}
      if(action==='portal-approve'){toast('Orçamento aprovado e oficina notificada.');return;}
      if(action==='save-settings'){const nameEl=document.getElementById('company-name'),unitEl=document.getElementById('company-unit'),emailEl=document.getElementById('company-email');if(!nameEl?.value.trim())return toast('Informe o nome da oficina.','error');if(!emailEl?.value.trim()||!emailEl.checkValidity())return toast('Informe um e-mail válido para os relatórios.','error');db.company.name=nameEl.value.trim();db.company.unit=unitEl?.value.trim()||'';db.company.email=emailEl.value.trim();saveDB();render();toast('Configurações salvas.');return;}
      if(action==='export-data'){exportData();return;}
      if(action==='reset-data'){if(confirm('ATENÇÃO: esta ação substitui os dados locais atuais pelos dados de demonstração. Deseja realmente continuar?')){db=normalizeAfterLoadV5(seedDB());saveDB();render();toast('Dados de demonstração restaurados.');}return;}
    } catch(error){console.error(error);toast(`Erro: ${error.message}`,'error');}
  }

  async function handleInput(event) {
    if(event.target.matches('[data-action="photo-upload"]'))await handlePhotoUpload(event.target);
    if(event.target.matches('[data-action="wizard-photo-upload"]'))await handleWizardPhotoUpload(event.target);
    if(event.target.id==='arrow-color'&&arrowEditorState)arrowEditorState.color=event.target.value;
    if(event.target.id==='arrow-width'&&arrowEditorState)arrowEditorState.width=Number(event.target.value);
    if(event.target.id==='client-search'){const term=event.target.value.toLowerCase();document.querySelectorAll('.client-card').forEach(card=>{card.hidden=!card.textContent.toLowerCase().includes(term);});}
    if(event.target.matches('#stage-entry-date,#stage-due-date,#stage-received-by,#stage-delivery-contact,#stage-defect,#stage-condition,#stage-accessories,#stage-record')){const {route,param}=parseRoute();if(route==='order'&&param)saveStageData(getOrder(param),false);}
    if(event.target.id==='import-file'){const file=event.target.files[0];if(!file)return;if(file.size>60*1024*1024){event.target.value='';return toast('O backup excede o limite de 60 MB.','error');}const reader=new FileReader();reader.onload=()=>{try{const parsed=JSON.parse(reader.result);if(!parsed||typeof parsed!=='object'||!Array.isArray(parsed.orders)||!Array.isArray(parsed.clients)||!Array.isArray(parsed.equipment))throw new Error('Estrutura inválida');if(!confirm('Importar este backup substituirá os dados locais atuais. Deseja continuar?')){event.target.value='';return;}const incoming=normalizeAfterLoadV5(parsed);db=incoming;saveDB();render();toast('Backup importado e validado.');}catch{toast('Arquivo de backup inválido.','error');}finally{event.target.value='';}};reader.onerror=()=>{event.target.value='';toast('Não foi possível ler o arquivo de backup.','error');};reader.readAsText(file);}
  }

  function openDatePicker(event){const input=event.target.closest('input[type="date"],input[type="datetime-local"]');if(input&&typeof input.showPicker==='function'){try{input.showPicker();}catch{}}}

  /* =========================
     AR7 V7 — revisão de usabilidade, navegação e relatório
     ========================= */
  let renderedRouteKeyV7 = '';
  var tabIdV7 = `tab-${Math.random().toString(36).slice(2)}`;
  var syncChannelV7 = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('ar7-oficina-sync-v7') : null;

  function captureUIStateV7() {
    const active=document.activeElement;
    const focus=active&&active!==document.body?{id:active.id||'',name:active.getAttribute?.('name')||'',start:typeof active.selectionStart==='number'?active.selectionStart:null,end:typeof active.selectionEnd==='number'?active.selectionEnd:null}:null;
    const scrolls=[...document.querySelectorAll('[data-preserve-scroll],.kanban,.table-wrap,.pdf-shell-v5')].map((el,index)=>({key:el.dataset.preserveScroll||`${el.className}-${index}`,left:el.scrollLeft,top:el.scrollTop}));
    return {x:window.scrollX,y:window.scrollY,focus,scrolls};
  }
  function restoreUIStateV7(state) {
    if(!state)return;
    window.scrollTo(state.x,state.y);
    const elements=[...document.querySelectorAll('[data-preserve-scroll],.kanban,.table-wrap,.pdf-shell-v5')];
    state.scrolls.forEach((saved,index)=>{const el=elements.find((item,i)=>(item.dataset.preserveScroll||`${item.className}-${i}`)===saved.key)||elements[index];if(el){el.scrollLeft=saved.left;el.scrollTop=saved.top;}});
    if(state.focus){const selector=state.focus.id?`#${CSS.escape(state.focus.id)}`:state.focus.name?`[name="${CSS.escape(state.focus.name)}"]`:'';const el=selector?document.querySelector(selector):null;if(el){el.focus({preventScroll:true});if(state.focus.start!==null&&typeof el.setSelectionRange==='function')try{el.setSelectionRange(state.focus.start,state.focus.end);}catch{}}}
  }

  function saveDB() {
    try {
      localStorage.setItem(DB_KEY,JSON.stringify(db));
      syncChannelV7?.postMessage({type:'db-update',source:tabIdV7,at:Date.now()});
      return true;
    } catch(error) {
      console.error('Falha ao salvar banco local',error);
      const message=error?.name==='QuotaExceededError'?'O armazenamento deste dispositivo ficou cheio. Exporte um backup e remova fotos desnecessárias.':'Não foi possível salvar os dados neste dispositivo.';
      if(document.getElementById('toast-region'))toast(message,'error');
      return false;
    }
  }

  function navItems(portal=false) {
    return portal ? [
      ['portal','Visão geral','home'],['portal','Meus equipamentos','motor'],['portal','Ordens de serviço','clipboard'],['portal','Relatórios','chart'],['portal','Histórico','clock'],['portal','Fotos','camera']
    ] : [
      ['dashboard','Dashboard','home'],['orders','Ordens de Serviço','clipboard'],['clients','Clientes','users'],['equipment','Equipamentos','motor'],['parts','Peças','gear'],['workshop','Oficina','tools'],['reports','Relatórios','chart'],['portal','Portal do Cliente','globe'],['settings','Configurações','gear']
    ];
  }

  function shell(content,route,portal=false,portalClientId='') {
    const portalClient=getClient(portalClientId)||getClient('c3')||db.clients[0];
    const portalHref=portalClient?`portal/${portalClient.id}`:'portal';
    const nav=navItems(portal).map(([href,label,ico],index)=>{
      const actual=portal?portalHref:href;
      const active=portal?index===0:route===href;
      return `<a href="#${actual}" class="${active?'active':''}">${icon(ico)}<span>${safe(label)}</span></a>`;
    }).join('');
    return `<div class="app-shell ${portal?'portal-shell':''}">
      <aside class="sidebar" id="sidebar">
        <a class="brand" href="#${portal?portalHref:'dashboard'}"><span class="brand-logo-wrap"><img src="./assets/ar7-logo.png" alt="AR7 Elétrica"></span><small class="brand-subtitle">${portal?'Acompanhamento dos serviços':'Gestão de oficina, peças e relatórios'}</small></a>
        <nav class="nav">${nav}</nav>
        <div class="sidebar-foot"><div class="machine">${portal?'🏭':'⚡'}</div><div><strong>${safe(portal?portalClient?.name||'Cliente':db.company.name)}</strong><small>${portal?'Portal conectado':safe(db.company.unit)}</small><div class="sidebar-live"><span class="status-dot"></span>${portal?'Dados sincronizados':'Unidade ativa'}</div></div></div>
      </aside>
      <div class="sidebar-overlay" id="sidebar-overlay" hidden></div>
      <main class="main">
        <header class="topbar"><button class="menu-btn" data-action="toggle-menu" aria-label="Abrir menu">${icon('menu',24)}</button><div class="live-sync-indicator"><span></span>${portal?'Acompanhamento atualizado':'Operação atualizada'}</div><div class="top-actions"><button class="top-icon" aria-label="Notificações">${icon('bell')}<span>5</span></button><button class="top-icon" aria-label="Ajuda">${icon('help')}</button>${portal?'':`<button class="workspace">⚡ ${safe(db.company.name)} <small>v10</small> ▾</button>`}</div></header>
        ${content}
      </main>
    </div>`;
  }

  function kpi(value,label,ico,bg,href='',actionText='Abrir') {
    const body=`<div class="kpi-icon ${bg}">${icon(ico,23)}</div><div class="kpi-copy"><strong>${value}</strong><span>${safe(label)}</span>${href?`<small>${safe(actionText)} ${icon('arrow',12)}</small>`:''}</div>`;
    return href?`<a class="kpi kpi-link" href="${href}" aria-label="${safe(actionText)}: ${safe(label)}">${body}</a>`:`<div class="kpi">${body}</div>`;
  }

  function dashboardView() {
    const counts=Object.fromEntries(STAGES.map(stage=>[stage.id,db.orders.filter(order=>order.stage===stage.id).length]));
    const openCount=db.orders.filter(order=>order.stage!=='concluida').length;
    const pendingReports=db.orders.filter(order=>order.stage==='relatorio'||(order.stage==='concluida'&&!order.report?.sent)).length;
    const pendingParts=db.orders.flatMap(order=>order.parts||[]).filter(part=>!['Recebida','Separada','Instalada'].includes(part.status)).length;
    const overdue=db.orders.filter(order=>order.stage!=='concluida'&&order.dueDate&&order.dueDate<todayISO()).length;
    const queue=STAGES.map(stage=>{
      const orders=db.orders.filter(order=>order.stage===stage.id);
      const lineColor=stage.id==='pecas'?'#e69a13':stage.id==='concluida'?'#239257':stage.id==='montagem'?'#62556e':stage.id==='testes'?'#477a7c':'#c9202f';
      return `<section class="kanban-col"><a class="kanban-head kanban-head-link" href="#orders/${stage.id}" style="border-bottom-color:${lineColor}"><span>${safe(stage.label)}</span><span>${orders.length} ${icon('arrow',12)}</span></a><div class="kanban-list">${orders.slice(0,4).map(order=>{const eq=getEquipment(order.equipmentId),client=getClient(order.clientId);return `<article class="os-mini" tabindex="0" role="button" data-action="open-order" data-id="${order.id}"><strong>OS #${safe(order.number)}</strong><p>${safe(equipmentDescription(eq))}</p><p>${safe(client?.name||'Cliente não encontrado')}</p><div class="mini-status">${badge(formatDate(order.dueDate),order.dueDate&&order.dueDate<todayISO()&&order.stage!=='concluida'?'red':'gray')}</div></article>`;}).join('')||'<div class="empty compact"><span>Nenhuma OS</span></div>'}${orders.length>4?`<a class="queue-more" href="#orders/${stage.id}">Ver mais ${orders.length-4}</a>`:''}</div></section>`;
    }).join('');
    const clientsRank=db.clients.map(client=>({client,count:db.orders.filter(order=>order.clientId===client.id).length})).sort((a,b)=>b.count-a.count);
    return shell(`<div class="page dashboard-page">${pageHead('Olá, Administrador!','Clique nos indicadores para abrir diretamente a fila correspondente.',`<button class="btn btn-primary" data-action="new-order">${icon('plus')} Nova ordem de serviço</button>`)}
      <div class="grid kpi-grid dashboard-kpis">
        ${kpi(openCount,'OS abertas','clipboard','bg-blue','#orders/open','Escolher OS')}
        ${kpi(counts.entrada,'Na recepção','users','bg-gray','#orders/entrada','Ver recebimentos')}
        ${kpi(counts.diagnostico+counts.montagem,'Na oficina','tools','bg-purple','#workshop','Abrir oficina')}
        ${kpi(counts.pecas,'Com compras','box','bg-amber','#parts','Abrir compras')}
        ${kpi(counts.testes,'Em qualidade','chart','bg-teal','#orders/testes','Ver testes')}
        ${kpi(pendingReports,'Para relatórios','file','bg-blue','#reports','Abrir relatórios')}
        ${kpi(counts.concluida,'Concluídas','check','bg-green','#orders/concluida','Ver concluídas')}
      </div>
      <section class="card queue-card"><div class="card-head"><div><h2>Fila de trabalho por equipe</h2><p>Clique no nome da etapa para abrir somente aquela fila.</p></div><a href="#orders/open" class="table-link">Ver todas as OS abertas</a></div><div class="card-body"><div class="kanban" data-preserve-scroll="dashboard-kanban">${queue}</div></div></section>
      <div class="grid dashboard-secondary"><section class="card"><div class="card-head"><h2>Produtividade mensal</h2>${badge('Últimos 6 meses','blue')}</div><div class="card-body"><div class="chart">${[32,45,38,50,62,counts.concluida*11].map((value,index)=>`<div class="bar-wrap"><strong>${value}</strong><div class="bar ${index===5?'current':''}" style="height:${Math.max(10,value)}%"></div><span>${['Mar','Abr','Mai','Jun','Jul','Ago'][index]}</span></div>`).join('')}</div></div></section><div class="stack"><section class="card"><div class="card-head"><h2>Alertas importantes</h2></div><div class="card-body alert-list"><a class="alert-item alert-link" href="#parts"><div class="alert-icon tone-red">${icon('alert')}</div><div><strong>${pendingParts} peças ainda pendentes</strong><p>Abrir fila de materiais sem recebimento.</p></div>${icon('arrow',16)}</a><a class="alert-item alert-link" href="#orders/open"><div class="alert-icon tone-amber">${icon('clock')}</div><div><strong>${overdue} ordens atrasadas</strong><p>Localizar OS com prazo ultrapassado.</p></div>${icon('arrow',16)}</a><a class="alert-item alert-link" href="#reports"><div class="alert-icon tone-blue">${icon('file')}</div><div><strong>${pendingReports} relatórios não enviados</strong><p>Abrir gerador e fila de relatórios.</p></div>${icon('arrow',16)}</a></div></section><section class="card"><div class="card-head"><h2>Clientes atendidos</h2></div><div class="card-body ranking-list">${clientsRank.map((item,index)=>`<a class="ranking-item ranking-link" href="#client/${item.client.id}"><span>${index+1}º</span><div><strong>${safe(item.client.name)}</strong><small>${item.count} ordem(ns) de serviço</small></div>${icon('arrow',15)}</a>`).join('')}</div></section></div></div>
    </div>`,'dashboard');
  }

  function orderFilterLabelV7(filter) {
    if(filter==='open')return 'OS abertas';
    return STAGES.find(s=>s.id===filter)?.label||'Todas as etapas';
  }
  function ordersView(initialFilter='') {
    const selected=initialFilter||'';
    const rows=db.orders.map(order=>{const client=getClient(order.clientId),eq=getEquipment(order.equipmentId);const visible=!selected||(selected==='open'?order.stage!=='concluida':order.stage===selected);return `<tr data-stage="${order.stage}" style="${visible?'':'display:none'}"><td><a class="table-link" href="#order/${order.id}">#${safe(order.number)}</a></td><td>${safe(client?.name||'—')}</td><td><strong>${safe(eq?.tag||'—')}</strong><br><span class="muted-small">${safe(equipmentDescription(eq))}</span></td><td>${badge(stageLabel(order.stage),stageTone(order.stage))}</td><td>${formatDate(order.entryDate)}</td><td>${formatDate(order.dueDate)}</td><td>${safe(order.technician||'A definir')}</td><td><div class="row-actions"><button class="btn btn-light btn-sm" data-action="open-order" data-id="${order.id}">${icon('edit',14)} Abrir</button><button class="btn btn-light btn-sm" data-action="open-report" data-id="${order.id}">${icon('file',14)} Relatório</button></div></td></tr>`;}).join('');
    const visibleCount=db.orders.filter(order=>!selected||(selected==='open'?order.stage!=='concluida':order.stage===selected)).length;
    return shell(`<div class="page">${pageHead('Ordens de Serviço',`Filtro atual: ${safe(orderFilterLabelV7(selected))}.`,`<button class="btn btn-primary" data-action="new-order">${icon('plus')} Nova OS</button>`)}<section class="card"><div class="card-head"><div class="filters"><div class="search"><input class="input" id="order-search" placeholder="Pesquisar por OS, cliente ou TAG"></div><select class="select" id="order-stage-filter"><option value="" ${selected===''?'selected':''}>Todas as etapas</option><option value="open" ${selected==='open'?'selected':''}>Todas as OS abertas</option>${STAGES.map(s=>`<option value="${s.id}" ${selected===s.id?'selected':''}>${safe(s.label)}</option>`).join('')}</select></div><span id="orders-visible-count">${visibleCount} registro(s)</span></div><div class="table-wrap" data-preserve-scroll="orders-table"><table class="table" id="orders-table"><thead><tr><th>OS</th><th>Cliente</th><th>Equipamento</th><th>Etapa</th><th>Entrada</th><th>Prazo</th><th>Técnico</th><th>Ações</th></tr></thead><tbody>${rows}</tbody></table></div></section></div>`,'orders');
  }
  function handleFilter(){const search=(document.getElementById('order-search')?.value||'').toLowerCase();const stage=document.getElementById('order-stage-filter')?.value||'';let visible=0;document.querySelectorAll('#orders-table tbody tr').forEach(row=>{const text=row.textContent.toLowerCase();const rowStage=row.dataset.stage||'';const stageOk=!stage||(stage==='open'?rowStage!=='concluida':rowStage===stage);const show=text.includes(search)&&stageOk;row.style.display=show?'':'none';if(show)visible++;});const count=document.getElementById('orders-visible-count');if(count)count.textContent=`${visible} registro(s)`;}

  function orderTimestampV7(order){return new Date(order.availableSince||order.createdAt||`${order.entryDate||todayISO()}T00:00:00`).getTime()||0;}
  function latestOrderForEquipmentV7(equipmentId,orders=db.orders){const list=orders.filter(o=>o.equipmentId===equipmentId).sort((a,b)=>orderTimestampV7(b)-orderTimestampV7(a));return list.find(o=>o.stage!=='concluida')||list[0]||null;}
  function progressForOrderV7(order){if(!order)return 0;return Math.round(stageIndex(order.stage)/(STAGES.length-1)*100);}
  function equipmentProgressCardV7(eq,order,portal=false){
    if(!order)return `<article class="equipment-progress-card is-idle"><div class="equipment-progress-head"><div><span>${safe(eq.tag)}</span><h3>${safe(equipmentDescription(eq))}</h3></div>${badge('Sem OS ativa','gray')}</div><p>Nenhum serviço em andamento para este equipamento.</p></article>`;
    const idx=stageIndex(order.stage),progress=progressForOrderV7(order),next=STAGES[Math.min(idx+1,STAGES.length-1)];
    const steps=STAGES.map((stage,i)=>`<span class="equipment-step ${i<idx?'done':''} ${i===idx?'active':''}" title="${safe(stage.label)}"><i></i><b>${safe(stage.label)}</b></span>`).join('');
    const actions=portal?`${order.report?.sent?`<button class="btn btn-light btn-sm" data-action="portal-report" data-id="${order.id}">${icon('file',14)} Ver relatório</button>`:''}`:`<button class="btn btn-primary btn-sm" data-action="open-order" data-id="${order.id}">Abrir OS ${icon('arrow',14)}</button>`;
    return `<article class="equipment-progress-card"><div class="equipment-progress-head"><div><span>${safe(eq.tag)} · OS #${safe(order.number)}</span><h3>${safe(equipmentDescription(eq))}</h3></div>${badge(stageLabel(order.stage),stageTone(order.stage))}</div><div class="progress-summary"><div><strong>${progress}%</strong><span>andamento</span></div><div><small>Agora com</small><strong>${safe(stageTeam(order.stage))}</strong></div><div><small>Próxima etapa</small><strong>${order.stage==='concluida'?'Processo finalizado':safe(next.label)}</strong></div><div><small>Previsão</small><strong>${formatDate(order.dueDate)}</strong></div></div><div class="equipment-progress-track"><span style="width:${progress}%"></span></div><div class="equipment-steps">${steps}</div><div class="equipment-progress-foot"><small>Atualizado em ${formatDateTime(order.availableSince||order.createdAt||order.entryDate)}</small><div class="row-actions">${actions}</div></div></article>`;
  }

  function clientDetailView(clientId) {
    const client=getClient(clientId);if(!client)return notFoundView();const stats=clientStats(client);
    const progressCards=stats.equipment.map(eq=>equipmentProgressCardV7(eq,latestOrderForEquipmentV7(eq.id,stats.orders),false)).join('');
    const orderRows=[...stats.orders].sort((a,b)=>orderTimestampV7(b)-orderTimestampV7(a)).map(order=>`<tr><td><a class="table-link" href="#order/${order.id}">#${safe(order.number)}</a></td><td>${safe(equipmentDescription(getEquipment(order.equipmentId)))}</td><td>${badge(stageLabel(order.stage),stageTone(order.stage))}</td><td>${safe(stageTeam(order.stage))}</td><td>${formatDate(order.dueDate)}</td><td><button class="btn btn-light btn-sm" data-action="open-order" data-id="${order.id}">Abrir</button></td></tr>`).join('');
    return shell(`<div class="page">${pageHead(safe(client.name),'Acompanhamento operacional atualizado diretamente pelas etapas da oficina.',`<button class="btn btn-light" data-action="edit-client" data-id="${client.id}">${icon('edit')} Editar cliente</button><button class="btn btn-light" data-action="enter-client-portal" data-id="${client.id}">${icon('globe')} Ver como cliente</button><button class="btn btn-primary" data-action="new-order">${icon('plus')} Nova OS</button>`)}<section class="client-profile card"><div class="client-profile-main"><div class="client-avatar large">${safe(client.name.slice(0,2).toUpperCase())}</div><div><h2>${safe(client.name)}</h2><p>${safe(client.cnpj||'CNPJ não informado')}</p><div class="client-profile-tags">${badge(client.active?'Ativo':'Inativo',client.active?'green':'gray')}${badge('Atualização operacional automática','blue')}</div></div></div><div class="client-profile-contact"><div><span>Contato principal</span><strong>${safe(client.contact||'—')}</strong></div><div><span>Telefone</span><strong>${safe(client.phone||'—')}</strong></div><div><span>E-mail</span><strong>${safe(client.email||'—')}</strong></div><div><span>Endereço</span><strong>${safe(client.address||'—')}</strong></div></div></section><div class="grid client-detail-kpis">${kpi(stats.equipment.length,'Equipamentos','motor','bg-blue')}${kpi(stats.open.length,'OS em andamento','clipboard','bg-amber')}${kpi(stats.orders.filter(o=>o.stage==='testes').length,'Em testes','chart','bg-teal')}${kpi(stats.reports.length,'Relatórios enviados','file','bg-green')}</div><section class="card client-live-card"><div class="card-head"><div><h2>Andamento de cada equipamento</h2><p>Cada mudança feita pela oficina aparece nesta visão usando o mesmo banco de dados.</p></div><span class="live-pill"><i></i>Atualizado</span></div><div class="card-body client-equipment-progress">${progressCards||'<div class="empty">Nenhum equipamento cadastrado.</div>'}</div></section><section class="card"><div class="card-head"><h2>Histórico de ordens de serviço</h2></div><div class="table-wrap"><table class="table"><thead><tr><th>OS</th><th>Equipamento</th><th>Etapa atual</th><th>Equipe</th><th>Prazo</th><th></th></tr></thead><tbody>${orderRows||'<tr><td colspan="6"><div class="empty">Nenhuma OS.</div></td></tr>'}</tbody></table></div></section>${client.notes?`<section class="card client-notes"><div class="card-head"><h2>Observações do cliente</h2></div><div class="card-body"><p>${safe(client.notes)}</p></div></section>`:''}</div>`,'clients');
  }

  function portalView(clientId='') {
    const client=getClient(clientId)||getClient('c3')||db.clients[0];if(!client)return notFoundView();
    const orders=db.orders.filter(o=>o.clientId===client.id),equipment=db.equipment.filter(e=>e.clientId===client.id);
    const currentOrders=equipment.map(eq=>latestOrderForEquipmentV7(eq.id,orders)).filter(Boolean);
    const awaiting=currentOrders.filter(o=>o.stage==='pecas').length,ready=currentOrders.filter(o=>o.stage==='concluida').length,reports=orders.filter(o=>o.report?.sent).length;
    const selector=db.clients.map(item=>`<a class="portal-client-chip ${item.id===client.id?'active':''}" href="#portal/${item.id}">${safe(item.name)}</a>`).join('');
    const progressCards=equipment.map(eq=>equipmentProgressCardV7(eq,latestOrderForEquipmentV7(eq.id,orders),true)).join('');
    const approvals=currentOrders.filter(o=>o.stage==='pecas').map(o=>{const eq=getEquipment(o.equipmentId),value=(o.parts||[]).length*1590;return `<div class="alert-item"><div class="alert-icon tone-amber">${icon('clock')}</div><div class="grow"><strong>OS #${safe(o.number)} · ${safe(eq?.tag)}</strong><p>Peças aguardando aprovação ou recebimento.</p></div><strong>R$ ${value.toLocaleString('pt-BR')},00</strong><button class="btn btn-light btn-sm" data-action="portal-approve" data-id="${o.id}">Aprovar</button></div>`;}).join('');
    const recent=[...orders].sort((a,b)=>orderTimestampV7(b)-orderTimestampV7(a)).slice(0,6);
    return shell(`<div class="page portal-page">${pageHead('Portal do Cliente',`${safe(client.name)} acompanha cada equipamento e a equipe responsável pela etapa atual.`, `<span class="live-pill"><i></i>Dados atualizados</span>`)}<div class="portal-client-switcher"><span>Visualização:</span>${selector}</div><div class="grid kpi-grid portal-kpis">${kpi(currentOrders.filter(o=>o.stage!=='concluida').length,'Em manutenção','tools','bg-blue')}${kpi(awaiting,'Aguardando peças','clock','bg-amber')}${kpi(ready,'Prontos para retirada','check','bg-green')}${kpi(reports,'Relatórios disponíveis','file','bg-purple')}</div><section class="card portal-live-card"><div class="card-head"><div><h2>Andamento dos seus equipamentos</h2><p>Quando a oficina conclui uma etapa, o status e a próxima equipe são atualizados nesta área.</p></div></div><div class="card-body client-equipment-progress portal-progress-grid">${progressCards||'<div class="empty">Nenhum equipamento cadastrado.</div>'}</div></section><div class="grid portal-bottom-layout"><section class="card"><div class="card-head"><h2>Atualizações recentes</h2></div><div class="card-body timeline">${recent.map(o=>`<div class="timeline-item"><strong>${safe(getEquipment(o.equipmentId)?.tag||'Equipamento')} · ${safe(stageLabel(o.stage))}</strong><p>OS #${safe(o.number)} · ${formatDateTime(o.availableSince||o.createdAt||o.entryDate)}</p><p>${safe(o.records?.tests||o.records?.assembly||o.records?.diagnosis||o.defect||'Atualização operacional registrada.')}</p></div>`).join('')||'<div class="empty">Nenhuma atualização.</div>'}</div></section><aside class="stack"><section class="card"><div class="card-head"><h2>Aprovações e pendências</h2></div><div class="card-body alert-list">${approvals||'<div class="empty">Nenhuma aprovação pendente.</div>'}</div></section><section class="card"><div class="card-head"><h2>Relatórios disponíveis</h2></div><div class="card-body alert-list">${orders.filter(o=>o.report?.sent).map(o=>`<div class="alert-item"><div class="alert-icon tone-blue">${icon('file')}</div><div class="grow"><strong>OS #${safe(o.number)}</strong><p>Enviado em ${formatDateTime(o.report.sentAt)}</p></div><button class="btn btn-light btn-sm" data-action="portal-report" data-id="${o.id}">${icon('download',14)} Abrir</button></div>`).join('')||'<div class="empty">Nenhum relatório disponível.</div>'}</div></section></aside></div></div>`,'portal',true,client.id);
  }

  function professionalReportTextV7(order) {
    const eq=getEquipment(order.equipmentId),records=order.records||{};
    const equipment=equipmentDescription(eq);
    return {
      scope:`Este relatório técnico tem por objetivo registrar, de forma rastreável, as condições identificadas, os serviços executados e os resultados obtidos durante a manutenção do equipamento ${equipment}. As informações apresentadas correspondem às verificações realizadas no período da ordem de serviço ${order.number}.`,
      method:`O equipamento foi identificado, inspecionado visualmente e submetido às verificações aplicáveis ao seu tipo e condição de recebimento. A avaliação considerou evidências fotográficas, inspeções mecânicas e elétricas, componentes substituídos e medições registradas durante o processo.`,
      diagnosis:records.diagnosis||`Durante a inspeção técnica foram avaliadas as condições gerais do equipamento, seus componentes, pontos de apoio, elementos de vedação e conexões. O diagnóstico definitivo deve ser complementado com as observações específicas registradas pela equipe responsável.`,
      assembly:records.assembly||`Os serviços foram executados conforme a necessidade técnica identificada, respeitando a sequência de desmontagem, limpeza, substituição ou recuperação de componentes, montagem, ajustes e conferências finais.`,
      tests:records.tests||`Após a montagem, o equipamento foi submetido aos testes e medições registrados neste documento. Os resultados devem ser interpretados em conjunto com os limites informados e com as condições existentes no momento do ensaio.`,
      conclusion:records.conclusion||`Com base nas inspeções, intervenções e testes realizados, o equipamento apresenta condição compatível com a liberação indicada pela equipe técnica, respeitadas as recomendações e limitações descritas neste relatório.`,
      recommendations:records.recommendations||`Recomenda-se manter o equipamento em programa de inspeção preventiva, acompanhar ruído, vibração, temperatura e corrente durante a operação e comunicar imediatamente qualquer alteração significativa de desempenho.`
    };
  }
  function scaledArrowMarkupV7(annotation,width,height) {
    const sx=width/1000,sy=height/1000;
    const a={x1:annotation.x1*sx,y1:annotation.y1*sy,x2:annotation.x2*sx,y2:annotation.y2*sy};
    const dx=a.x2-a.x1,dy=a.y2-a.y1,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len;
    const base=Math.max(width,height)/1000;
    const size=(22+(Number(annotation.width)||6)*3)*base,bx=a.x2-ux*size,by=a.y2-uy*size,px=-uy,py=ux;
    const left=`${bx+px*size*.42},${by+py*size*.42}`,right=`${bx-px*size*.42},${by-py*size*.42}`;
    const color=safe(annotation.color||'#c9202f'),lineWidth=Math.max(2,Number(annotation.width)||6)*2*base;
    return `<line x1="${a.x1}" y1="${a.y1}" x2="${bx+ux*3}" y2="${by+uy*3}" stroke="${color}" stroke-width="${lineWidth}" stroke-linecap="round"/><polygon points="${a.x2},${a.y2} ${left} ${right}" fill="${color}"/>`;
  }
  function reportPhotoSvgV7(photo,className='') {
    const p=normalizePhotoV5(photo),width=Math.max(1,p.width||1200),height=Math.max(1,p.height||800);
    return `<div class="report-photo-media ${className}"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${safe(p.caption||'Evidência fotográfica')}"><image href="${safe(p.src)}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="none"/>${(p.annotations||[]).map(a=>scaledArrowMarkupV7(a,width,height)).join('')}</svg></div>`;
  }
  function reportPhotoSection(title,photos,orderNumber='') {
    if(!photos.length)return '';
    const pages=[];for(let start=0;start<photos.length;start+=2)pages.push(photos.slice(start,start+2));
    return pages.map((page,pageIndex)=>`<section class="report-page report-photo-page"><div class="report-page-header"><img src="./assets/ar7-logo.png" alt="AR7"><div><span>RELATÓRIO TÉCNICO · OS ${safe(orderNumber)}</span><strong>${safe(title)}${pages.length>1?` · ${pageIndex+1}/${pages.length}`:''}</strong></div></div><div class="report-photo-grid">${page.map((photo,index)=>`<figure>${reportPhotoSvgV7(photo)}<figcaption><strong>Foto ${pageIndex*2+index+1}</strong><span>${safe(normalizePhotoV5(photo).caption||`${title} — registro fotográfico da etapa`)}</span></figcaption></figure>`).join('')}</div><div class="report-standard-note">As imagens integram a rastreabilidade da ordem de serviço e devem ser analisadas em conjunto com os registros técnicos do relatório.</div><div class="report-footer"><span>AR7 Elétrica</span><span>Evidências fotográficas · ${safe(title)}</span></div></section>`).join('');
  }
  function reportPageCount(order){return 4+['before','during','assembly','after'].reduce((total,group)=>total+Math.ceil((order.photos?.[group]?.length||0)/2),0);}

  function reportDocumentV5(order) {
    const client=getClient(order.clientId),eq=getEquipment(order.equipmentId),records=order.records||{},texts=professionalReportTextV7(order);
    const hero=(order.photos.after||[])[0]||(order.photos.before||[])[0];
    const measurements=(order.measurements||[]).map(m=>`<tr><td>${safe(m.name)}</td><td>${safe(m.unit)}</td><td>${safe(m.before)}</td><td>${safe(m.after)}</td><td>${safe(m.limit)}</td><td>${safe(m.status||'Registrado')}</td></tr>`).join('');
    const parts=(order.parts||[]).map(p=>`<tr><td>${safe(p.name)}</td><td>${safe(p.position||'—')}</td><td>${safe(p.code||'—')}</td><td>${safe(p.dimensions||'—')}</td><td>${safe(partQuantity(p))}</td><td>${safe(p.status||'—')}</td></tr>`).join('');
    const documentCode=`RT-AR7-${safe(order.number)}`;
    return `<div class="report-document" id="printable-report">
      <section class="report-page report-cover"><div class="cover-brand"><img src="./assets/ar7-logo.png" alt="AR7 Elétrica"><div><span>${documentCode}</span><strong>RELATÓRIO TÉCNICO</strong></div></div><div class="cover-title"><span>MANUTENÇÃO ELETROMECÂNICA</span><h1>OS ${safe(order.number)}</h1><p>${safe(equipmentDescription(eq))}</p></div>${hero?reportPhotoSvgV7(hero,'report-cover-photo'):`<div class="report-cover-placeholder">${icon('motor',64)}<span>Imagem principal não adicionada</span></div>`}<div class="cover-data"><div><span>Cliente</span><strong>${safe(client?.name||'—')}</strong></div><div><span>TAG / número de série</span><strong>${safe(eq?.tag||'—')} · ${safe(eq?.serial||'Não informado')}</strong></div><div><span>Data de entrada</span><strong>${formatDate(order.entryDate)}</strong></div><div><span>Prazo previsto</span><strong>${formatDate(order.dueDate)}</strong></div></div><div class="report-confidential">Documento técnico emitido para registro da intervenção realizada. A reprodução parcial deve preservar o contexto e a identificação da ordem de serviço.</div><div class="report-footer"><span>${documentCode}</span><span>Gerado em ${new Intl.DateTimeFormat('pt-BR',{dateStyle:'long'}).format(new Date())}</span></div></section>
      <section class="report-page"><div class="report-page-header"><img src="./assets/ar7-logo.png" alt="AR7"><div><span>${documentCode}</span><strong>Identificação, objetivo e critérios</strong></div></div><div class="report-info-grid"><article><span>Cliente</span><strong>${safe(client?.name||'—')}</strong><p>${safe(client?.contact||'Contato não informado')} · ${safe(client?.email||'E-mail não informado')}</p></article><article><span>Equipamento</span><strong>${safe(equipmentDescription(eq))}</strong><p>${safe(eq?.tag||'Sem TAG')} · ${safe(eq?.manufacturer||'Fabricante não informado')} · ${safe(eq?.power||'Potência não informada')}</p></article><article><span>Defeito informado</span><p>${safe(order.defect||'Não informado')}</p></article><article><span>Condição no recebimento</span><p>${safe(order.reception?.condition||'Não informada')}</p></article></div><div class="report-text-section"><h2>1. Objetivo e escopo</h2><p>${safe(texts.scope)}</p></div><div class="report-text-section"><h2>2. Critérios de avaliação</h2><p>${safe(texts.method)}</p></div><div class="report-standard-note"><strong>Nota técnica:</strong> os resultados refletem as condições encontradas e os ensaios realizados no momento da manutenção. Alterações de instalação, carga ou operação posteriores não estão contempladas.</div><div class="report-footer"><span>${documentCode}</span><span>Página técnica · identificação</span></div></section>
      <section class="report-page"><div class="report-page-header"><img src="./assets/ar7-logo.png" alt="AR7"><div><span>${documentCode}</span><strong>Diagnóstico, intervenção e conclusão</strong></div></div><div class="report-text-section"><h2>3. Diagnóstico técnico</h2><p>${safe(texts.diagnosis)}</p></div><div class="report-text-section"><h2>4. Serviços executados</h2><p>${safe(texts.assembly)}</p></div><div class="report-text-section"><h2>5. Testes e verificações finais</h2><p>${safe(texts.tests)}</p></div><div class="report-text-section conclusion"><h2>6. Conclusão técnica</h2><p>${safe(texts.conclusion)}</p></div><div class="report-text-section recommendations"><h2>7. Recomendações</h2><p>${safe(texts.recommendations)}</p></div><div class="report-footer"><span>${documentCode}</span><span>Diagnóstico e conclusão</span></div></section>
      <section class="report-page"><div class="report-page-header"><img src="./assets/ar7-logo.png" alt="AR7"><div><span>${documentCode}</span><strong>Peças, medições e responsáveis</strong></div></div><h2 class="report-section-title">8. Componentes e materiais registrados</h2><table class="report-table"><thead><tr><th>Peça</th><th>Aplicação</th><th>Código</th><th>Medidas</th><th>Quantidade</th><th>Status</th></tr></thead><tbody>${parts||'<tr><td colspan="6">Serviço sem peças registradas.</td></tr>'}</tbody></table><h2 class="report-section-title">9. Medições e resultados</h2><table class="report-table"><thead><tr><th>Parâmetro</th><th>Unidade</th><th>Antes</th><th>Depois</th><th>Limite</th><th>Resultado</th></tr></thead><tbody>${measurements||'<tr><td colspan="6">Nenhuma medição registrada.</td></tr>'}</tbody></table><div class="report-result-legend"><span><i class="ok"></i> Resultado conforme registro</span><span><i></i> Avaliar juntamente com a conclusão técnica</span></div><div class="report-signatures"><div><span>Responsável pela execução</span><strong>${safe(order.technician||'A definir')}</strong><small>Equipe técnica</small></div><div><span>Revisão e aprovação</span><strong>${safe(order.supervisor||'A definir')}</strong><small>Supervisor responsável</small></div></div><div class="report-footer"><span>${documentCode}</span><span>Peças e medições</span></div></section>
      ${reportPhotoSection('Recebimento',order.photos.before||[],order.number)}${reportPhotoSection('Diagnóstico e desmontagem',order.photos.during||[],order.number)}${reportPhotoSection('Montagem',order.photos.assembly||[],order.number)}${reportPhotoSection('Equipamento finalizado',order.photos.after||[],order.number)}
    </div>`;
  }

  function reportDetailView(orderId) {
    const order=getOrder(orderId);if(!order)return notFoundView();order.records=order.records||{diagnosis:'',assembly:'',tests:'',conclusion:'',recommendations:''};
    const checks=reportChecklist(order),ready=reportReady(order),texts=professionalReportTextV7(order);
    return shell(`<div class="page report-generator-page">${pageHead('Gerador de Relatório Técnico','Revise o conteúdo, aplique textos profissionais e confira as imagens antes de salvar o PDF.',`<button class="btn btn-light" data-action="apply-report-template" data-id="${order.id}">${icon('file')} Aplicar textos padrão</button><button class="btn btn-light" data-action="save-report-data" data-id="${order.id}">${icon('save')} Salvar</button><button class="btn btn-primary" data-action="print-report" data-id="${order.id}">${icon('download')} Gerar / salvar PDF</button>`)}<div class="grid report-layout-v5"><aside class="stack report-editor-panel"><section class="card"><div class="card-head"><div><h2>Conteúdo final</h2><p>Os textos padrão podem ser ajustados conforme o serviço realizado.</p></div></div><div class="card-body stack"><div class="form-group"><label>Conclusão técnica *</label><textarea class="textarea report-editor-text" id="report-conclusion" placeholder="Conclusão final, condição do equipamento e liberação...">${safe(order.records.conclusion||'')}</textarea><small>Sugestão: ${safe(texts.conclusion)}</small></div><div class="form-group"><label>Recomendações</label><textarea class="textarea" id="report-recommendations" placeholder="Inspeção preventiva, acompanhamento de parâmetros e cuidados operacionais...">${safe(order.records.recommendations||'')}</textarea></div><div class="form-group"><label>Destinatário</label><input class="input" id="report-recipient" type="email" value="${safe(order.report.recipient||'')}"></div><div class="form-group"><label>Supervisor</label><input class="input" id="report-supervisor" value="${safe(order.supervisor||'')}"></div></div></section><section class="card"><div class="card-head"><h2>Checklist de qualidade</h2></div><div class="card-body alert-list">${checks.map(c=>`<div class="alert-item"><div class="alert-icon ${c.ok?'tone-blue':'tone-red'}">${icon(c.ok?'check':'alert',16)}</div><div><strong>${safe(c.label)}</strong><p>${safe(c.detail)}</p></div></div>`).join('')}</div></section><section class="card"><div class="card-body stack"><button class="btn ${(ready||order.report.approved)?'btn-success':'btn-light readiness-pending-v202'}" data-action="approve-report" data-id="${order.id}" ${order.report.approved||!ready?'disabled':''}>${icon((ready||order.report.approved)?'check':'clock')} ${order.report.approved?'Relatório aprovado':ready?'Pronto: aprovar relatório':'Concluir checklist para aprovar'}</button><button class="btn ${order.report.approved?'btn-success':'btn-light readiness-pending-v202'}" data-action="send-report" data-id="${order.id}" ${!order.report.approved?'disabled':''}>${icon(order.report.approved?'send':'clock')} ${order.report.approved?'Pronto: enviar ao cliente':'Aguardando aprovação do relatório'}</button><div class="form-group"><label>Agendar envio</label><input class="input" type="datetime-local" id="schedule-at" value="${order.report.scheduledAt||''}"><button class="btn btn-light" data-action="schedule-report" data-id="${order.id}">${icon('clock')} Agendar</button></div></div></section></aside><section class="pdf-shell pdf-shell-v5" data-preserve-scroll="report-preview"><div class="pdf-toolbar"><span>${icon('file',17)}</span><span>Relatorio_AR7_OS_${safe(order.number)}.pdf</span><span class="pdf-toolbar-meta">${reportPageCount(order)} páginas · imagens ajustadas</span></div>${reportDocumentV5(order)}</section></div></div>`,'reports');
  }

  function saveReportData(orderId,notify=true){const order=getOrder(orderId);if(!order)return;order.records=order.records||{};order.records.conclusion=(document.getElementById('report-conclusion')?.value??order.records.conclusion??'').trim();order.records.recommendations=(document.getElementById('report-recommendations')?.value??order.records.recommendations??'').trim();order.report.recipient=(document.getElementById('report-recipient')?.value??order.report.recipient??'').trim();order.supervisor=(document.getElementById('report-supervisor')?.value??order.supervisor??'').trim();saveDB();if(notify){render();toast('Dados do relatório salvos sem alterar sua posição na página.');}}

  function render(options={}) {
    const {route,param}=parseRoute(),routeKey=`${route}/${param||''}`;
    const resetScroll=options?.resetScroll===true||Boolean(renderedRouteKeyV7&&renderedRouteKeyV7!==routeKey);
    const state=resetScroll?null:captureUIStateV7();
    const views={dashboard:dashboardView,orders:()=>ordersView(param),clients:clientsView,client:()=>clientDetailView(param),equipment:equipmentView,parts:partsView,workshop:workshopView,reports:()=>reportsView(param),portal:()=>portalView(param),settings:settingsView,order:()=>orderDetailView(param)};
    try {document.getElementById('app').innerHTML=(views[route]||notFoundView)();renderedRouteKeyV7=routeKey;requestAnimationFrame(()=>{if(resetScroll)window.scrollTo(0,0);else restoreUIStateV7(state);});}
    catch(error){console.error('Falha ao renderizar',error);document.getElementById('app').innerHTML=`<div class="fatal-error"><h1>Não foi possível abrir esta tela</h1><p>${safe(error.message)}</p><button class="btn btn-primary" onclick="location.hash='#dashboard';location.reload()">Voltar ao dashboard</button></div>`;}
  }

  function applyReportTemplateV7(orderId){const order=getOrder(orderId);if(!order)return;order.records=order.records||{};const texts=professionalReportTextV7(order);if(!order.records.diagnosis)order.records.diagnosis=texts.diagnosis;if(!order.records.assembly)order.records.assembly=texts.assembly;if(!order.records.tests)order.records.tests=texts.tests;order.records.conclusion=`Com base nas inspeções, intervenções e testes registrados na OS ${order.number}, o equipamento ${equipmentDescription(getEquipment(order.equipmentId))} apresenta condição compatível com a liberação técnica indicada. O retorno à operação deve respeitar as condições de instalação, carga e uso definidas pelo fabricante e pelo processo do cliente.`;order.records.recommendations=`Recomenda-se incluir o equipamento no plano de manutenção preventiva, acompanhar periodicamente ruído, vibração, temperatura, corrente e condições de fixação, além de registrar qualquer alteração de desempenho. Uma nova inspeção deve ser programada conforme a criticidade do ativo e o histórico operacional.`;saveDB();render();toast('Textos profissionais aplicados. Revise antes de aprovar.');}


  // V8 — separação correta entre Compras, Oficina e portais de clientes.
  const PURCHASE_STATUSES_V8=['Solicitada','Em cotação','Comprada','Recebida','Separada'];
  const PORTAL_SESSION_KEY_V8='ar7-portal-client-v1';
  let portalSessionFallbackV8='';

  function getPortalSessionIdV8(){
    try{return sessionStorage.getItem(PORTAL_SESSION_KEY_V8)||portalSessionFallbackV8||'';}catch{return portalSessionFallbackV8||'';}
  }
  function setPortalSessionIdV8(clientId){
    portalSessionFallbackV8=clientId||'';
    try{if(clientId)sessionStorage.setItem(PORTAL_SESSION_KEY_V8,clientId);else sessionStorage.removeItem(PORTAL_SESSION_KEY_V8);}catch{}
  }
  function resolvePortalClientV8(requestedId=''){
    const sessionId=getPortalSessionIdV8();
    if(sessionId&&getClient(sessionId))return getClient(sessionId);
    const requested=getClient(requestedId);
    if(requested){setPortalSessionIdV8(requested.id);return requested;}
    const first=db.clients[0]||null;
    if(first)setPortalSessionIdV8(first.id);
    return first;
  }
  function portalOrderAllowedV8(order,client,requireSent=false){
    return Boolean(order&&client&&order.clientId===client.id&&(!requireSent||order.report?.sent));
  }
  function purchaseNextStatusV8(status){
    const index=PURCHASE_STATUSES_V8.indexOf(status);
    return index>=0?PURCHASE_STATUSES_V8[index+1]||'':'';
  }

  function shell(content,route,portal=false,portalClientId=''){
    const portalClient=portal?resolvePortalClientV8(portalClientId):null;
    const portalHref=portalClient?`portal/${portalClient.id}`:'portal';
    const nav=navItems(portal).map(([href,label,ico],index)=>{
      const actual=portal?portalHref:href;
      const active=portal?index===0:route===href;
      return `<a href="#${actual}" class="${active?'active':''}">${icon(ico)}<span>${safe(label)}</span></a>`;
    }).join('');
    const brandHref=portal?`#${portalHref}`:'#dashboard';
    const brandLabel=portal?'Ir para o dashboard da sua empresa':'Ir para o dashboard da AR7';
    return `<div class="app-shell ${portal?'portal-shell':''}">
      <aside class="sidebar" id="sidebar">
        <a class="brand" href="${brandHref}" aria-label="${brandLabel}" title="${brandLabel}"><span class="brand-logo-wrap"><img src="./assets/ar7-logo.png" alt="AR7 Elétrica"></span><small class="brand-subtitle">${portal?'Acompanhamento dos serviços':'Gestão de oficina, peças e relatórios'}</small></a>
        <nav class="nav">${nav}</nav>
        <div class="sidebar-foot"><div class="machine">${portal?'🏭':'⚡'}</div><div><strong>${safe(portal?portalClient?.name||'Cliente':db.company.name)}</strong><small>${portal?'Acesso exclusivo da empresa':safe(db.company.unit)}</small><div class="sidebar-live"><span class="status-dot"></span>${portal?'Dados isolados e sincronizados':'Unidade ativa'}</div></div></div>
      </aside>
      <div class="sidebar-overlay" id="sidebar-overlay" hidden></div>
      <main class="main">
        <header class="topbar"><button class="menu-btn" data-action="toggle-menu" aria-label="Abrir menu">${icon('menu',24)}</button><div class="live-sync-indicator"><span></span>${portal?'Acompanhamento atualizado':'Operação atualizada'}</div><div class="top-actions"><button class="top-icon" aria-label="Notificações">${icon('bell')}<span>5</span></button><button class="top-icon" aria-label="Ajuda">${icon('help')}</button>${portal?'':`<button class="workspace">⚡ ${safe(db.company.name)} <small>v10</small> ▾</button>`}</div></header>
        ${content}
      </main>
    </div>`;
  }

  function partsTableV5(order,purchaseMode=false){
    const workshopInstallMode=order.stage==='montagem'&&!purchaseMode;
    const rows=(order.parts||[]).map(part=>{
      const next=purchaseMode?purchaseNextStatusV8(part.status):'';
      let actions='';
      if(purchaseMode){
        const label=next?`Marcar como ${next}`:'';
        const purchaseAction=next?`<button class="btn btn-primary btn-sm" data-action="advance-part" data-order="${order.id}" data-part="${part.id}">${safe(label)}</button>`:`<span class="purchase-handoff-status">${part.status==='Separada'?'Aguardando instalação na Oficina':'Instalada pela Oficina'}</span>`;
        actions=`<button class="btn btn-light btn-sm" data-action="edit-purchase" data-order="${order.id}" data-part="${part.id}">Dados da compra</button>${purchaseAction}`;
      }else if(workshopInstallMode){
        if(part.status==='Instalada')actions=`<span class="workshop-installed">${icon('check',14)} Instalada pela Oficina</span>`;
        else if(part.status==='Separada')actions=`<button class="btn btn-success btn-sm" data-action="install-part" data-order="${order.id}" data-part="${part.id}">${icon('tools',14)} Confirmar instalação</button>`;
        else actions=`<button class="btn btn-light btn-sm" disabled>${icon('clock',14)} Aguardando separação</button>`;
      }
      return `<tr><td>${part.photo?`<img class="part-photo" src="${safe(part.photo)}" alt="Foto da peça">`:'<span class="part-photo-placeholder">—</span>'}</td><td><strong>${safe(part.name)}</strong><br><span class="muted-small">${safe(part.position||'Aplicação não informada')}</span>${part.technicalNote?`<details class="inline-details"><summary>Especificação técnica</summary><p>${safe(part.technicalNote)}</p></details>`:''}</td><td>${safe(part.code||'—')}</td><td>${safe(part.dimensions||'—')}</td><td>${safe(partQuantity(part))}</td><td>${badge(part.status,partTone(part.status))}</td><td><div class="row-actions">${actions}</div></td></tr>`;
    }).join('');
    const actionTitle=purchaseMode?'Ação de Compras':workshopInstallMode?'Confirmação da Oficina':' ';
    return `<div class="table-wrap parts-table-wrap"><table class="table parts-table"><thead><tr><th>Foto</th><th>Peça / aplicação</th><th>Código</th><th>Medidas</th><th>Qtd.</th><th>Status</th><th>${actionTitle}</th></tr></thead><tbody>${rows||'<tr><td colspan="7"><div class="empty"><strong>Nenhuma peça informada</strong><span>Adicione uma necessidade técnica ou marque que o serviço não precisa de peças.</span></div></td></tr>'}</tbody></table></div>`;
  }

  function partsView(){
    const parts=db.orders.flatMap(order=>(order.parts||[]).map(part=>({...part,order})));
    const rows=parts.map(item=>{
      const eq=getEquipment(item.order.equipmentId),commercial=item.purchase||{},next=purchaseNextStatusV8(item.status);
      const actionLabel=next?`Marcar como ${next}`:'';
      return `<tr><td>${item.photo?`<img class="part-photo" src="${safe(item.photo)}" alt="Foto da peça">`:'<span class="part-photo-placeholder">—</span>'}</td><td><div class="part-technical"><strong>${safe(item.name)}</strong><small>Código: ${safe(item.code||'não informado')}</small><small>Medidas: ${safe(item.dimensions||'não informadas')}</small><small>Aplicação: ${safe(item.position||'não informada')}</small></div></td><td><a class="table-link" href="#order/${item.order.id}">OS #${safe(item.order.number)}</a><br>${safe(eq?.tag||'—')} · ${safe(equipmentDescription(eq))}</td><td>${safe(partQuantity(item))}</td><td>${badge(item.status,partTone(item.status))}</td><td><div class="commercial-summary"><strong>${safe(commercial.supplier||'Compras ainda não preencheu')}</strong><span>${commercial.expectedDate?`Previsão: ${formatDate(commercial.expectedDate)}`:'Sem previsão'}</span><span>${commercial.quote?`Cotação/Pedido: ${safe(commercial.quote)}`:''}</span></div></td><td>${safe(commercial.location||'—')}</td><td><div class="row-actions"><button class="btn btn-light btn-sm" data-action="edit-purchase" data-order="${item.order.id}" data-part="${item.id}">${icon('edit',14)} Dados da compra</button>${next?`<button class="btn btn-primary btn-sm" data-action="advance-part" data-order="${item.order.id}" data-part="${item.id}">${safe(actionLabel)}</button>`:`<span class="purchase-handoff-status">${item.status==='Separada'?'Aguardando instalação na Oficina':'Instalada pela Oficina'}</span>`}</div></td></tr>`;
    }).join('');
    const pending=parts.filter(part=>!['Recebida','Separada','Instalada'].includes(part.status)).length;
    return shell(`<div class="page">${pageHead('Peças e Compras','Compras encerra sua responsabilidade quando a peça está recebida e separada para a OS. A instalação pertence exclusivamente à Oficina.',`<button class="btn btn-primary" data-action="new-part-global">${icon('plus')} Nova solicitação técnica</button>`)}<div class="grid kpi-grid parts-kpis-v2022">${kpi(parts.length,'Itens rastreados','gear','bg-blue')}${kpi(parts.filter(p=>p.status==='Solicitada').length,'Aguardando Compras','clipboard','bg-red')}${kpi(parts.filter(p=>p.status==='Comprada').length,'Comprados','box','bg-amber')}${kpi(pending,'Pendentes de recebimento','clock','bg-purple')}</div><section class="card"><div class="card-head"><div><h2>Fila de materiais</h2><p>A última ação de Compras é “Separada”. A confirmação “Instalada” aparece somente na etapa de Montagem da Oficina.</p></div></div><div class="table-wrap"><table class="table"><thead><tr><th>Foto</th><th>Especificação técnica</th><th>OS / Equipamento</th><th>Qtd.</th><th>Status</th><th>Dados de Compras</th><th>Local</th><th>Ações</th></tr></thead><tbody>${rows||'<tr><td colspan="8"><div class="empty">Nenhuma peça cadastrada</div></td></tr>'}</tbody></table></div></section></div>`,'parts');
  }

  function stageRequirements(order){
    const records=order.records||{};
    const parts=order.parts||[];
    const separated=parts.filter(part=>['Separada','Instalada'].includes(part.status)).length;
    const installed=parts.filter(part=>part.status==='Instalada').length;
    const requirements={
      entrada:[{label:'Dados do recebimento preenchidos',ok:Boolean(order.defect&&order.dueDate&&order.reception?.receivedBy)},{label:'Pelo menos uma foto no recebimento',ok:(order.photos.before||[]).length>0}],
      diagnostico:[{label:'Diagnóstico técnico registrado',ok:Boolean(records.diagnosis?.trim().length>=10)},{label:'Fotos da desmontagem ou diagnóstico',ok:(order.photos.during||[]).length>0},{label:'Peças informadas ou marcado “não precisa de peças”',ok:order.noPartsRequired||parts.length>0}],
      pecas:[{label:'Todas as peças recebidas e separadas para esta OS',ok:order.noPartsRequired||(parts.length>0&&separated===parts.length)},{label:'Compras não confirma instalação; a próxima conferência pertence à Oficina',ok:true}],
      montagem:[{label:'Registro técnico da montagem salvo',ok:Boolean(records.assembly?.trim().length>=10)},{label:'Foto durante a montagem adicionada',ok:(order.photos.assembly||[]).length>0},{label:'Todas as peças necessárias confirmadas como instaladas pela Oficina',ok:order.noPartsRequired||parts.length===0||installed===parts.length}],
      testes:[{label:'Resultado dos testes registrado',ok:Boolean(records.tests?.trim().length>=10)},{label:'Pelo menos uma medição ou teste registrado',ok:(order.measurements||[]).length>0},{label:'Foto final do equipamento adicionada',ok:(order.photos.after||[]).length>0}],
      relatorio:[{label:'Dados obrigatórios do relatório completos',ok:reportReady(order)},{label:'Aprovação do supervisor',ok:Boolean(order.report.approved)},{label:'Relatório enviado ao cliente',ok:Boolean(order.report.sent)}],
      concluida:[{label:'Processo encerrado e disponível ao cliente',ok:true}]
    };
    return requirements[order.stage]||[];
  }

  function advancePart(orderId,partId){
    const order=getOrder(orderId),part=order?.parts.find(item=>item.id===partId);if(!part)return;
    const next=purchaseNextStatusV8(part.status);
    if(!next){toast(part.status==='Separada'?'A peça já foi separada. A instalação deve ser confirmada pela Oficina na etapa de Montagem.':'A instalação já foi registrada pela Oficina.','error');return;}
    if(part.status==='Em cotação'&&!partSupplier(part)){toast('Antes de marcar como comprada, informe o fornecedor em “Dados da compra”.','error');return;}
    part.status=next;
    if(next==='Recebida'&&!partLocation(part))part.purchase.location=`Caixa OS ${order.number}`;
    addActivity(`${part.name} da OS #${order.number}: ${next} por Compras.`);saveDB();render();toast(`Peça atualizada para ${next}.`);
  }

  function installPartV8(orderId,partId){
    const order=getOrder(orderId),part=order?.parts.find(item=>item.id===partId);if(!part)return;
    if(order.stage!=='montagem'){toast('A instalação só pode ser confirmada pela Oficina durante a etapa de Montagem.','error');return;}
    if(part.status!=='Separada'){toast(part.status==='Instalada'?'Esta peça já foi confirmada como instalada.':'A peça precisa estar recebida e separada por Compras antes da instalação.','error');return;}
    part.status='Instalada';
    part.installedAt=new Date().toISOString();
    part.installedBy=order.technician||'Oficina';
    addActivity(`${part.name} da OS #${order.number}: instalação confirmada pela Oficina.`);saveDB();render();toast(`${part.name} confirmada como instalada pela Oficina.`);
  }

  function portalView(requestedClientId=''){
    const client=resolvePortalClientV8(requestedClientId);if(!client)return notFoundView();
    const orders=db.orders.filter(order=>order.clientId===client.id),equipment=db.equipment.filter(eq=>eq.clientId===client.id);
    const currentOrders=equipment.map(eq=>latestOrderForEquipmentV7(eq.id,orders)).filter(Boolean);
    const awaiting=currentOrders.filter(order=>order.stage==='pecas').length,ready=currentOrders.filter(order=>order.stage==='concluida').length,reports=orders.filter(order=>order.report?.sent).length;
    const progressCards=equipment.map(eq=>equipmentProgressCardV7(eq,latestOrderForEquipmentV7(eq.id,orders),true)).join('');
    const approvals=currentOrders.filter(order=>order.stage==='pecas').map(order=>{const eq=getEquipment(order.equipmentId);return `<div class="alert-item"><div class="alert-icon tone-amber">${icon('clock')}</div><div class="grow"><strong>OS #${safe(order.number)} · ${safe(eq?.tag||'Equipamento')}</strong><p>Peças aguardando aprovação ou recebimento.</p></div><button class="btn btn-light btn-sm" data-action="portal-approve" data-id="${order.id}">Aprovar</button></div>`;}).join('');
    const recent=[...orders].sort((a,b)=>orderTimestampV7(b)-orderTimestampV7(a)).slice(0,6);
    return shell(`<div class="page portal-page">${pageHead('Dashboard da empresa',`${safe(client.name)} visualiza exclusivamente os próprios equipamentos, ordens e relatórios.`,`<span class="live-pill"><i></i>Dados atualizados</span>`)}<section class="portal-isolation-notice">${icon('check',18)}<div><strong>Acesso exclusivo de ${safe(client.name)}</strong><span>Não existem seletores ou links para dados de outras empresas.</span></div></section><div class="grid kpi-grid portal-kpis">${kpi(currentOrders.filter(o=>o.stage!=='concluida').length,'Em manutenção','tools','bg-blue')}${kpi(awaiting,'Aguardando peças','clock','bg-amber')}${kpi(ready,'Prontos para retirada','check','bg-green')}${kpi(reports,'Relatórios disponíveis','file','bg-purple')}</div><section class="card portal-live-card"><div class="card-head"><div><h2>Andamento dos seus equipamentos</h2><p>Cada equipamento utiliza somente ordens vinculadas ao cadastro desta empresa.</p></div></div><div class="card-body client-equipment-progress portal-progress-grid">${progressCards||'<div class="empty">Nenhum equipamento cadastrado.</div>'}</div></section><div class="grid portal-bottom-layout"><section class="card"><div class="card-head"><h2>Atualizações recentes</h2></div><div class="card-body timeline">${recent.map(order=>`<div class="timeline-item"><strong>${safe(getEquipment(order.equipmentId)?.tag||'Equipamento')} · ${safe(stageLabel(order.stage))}</strong><p>OS #${safe(order.number)} · ${formatDateTime(order.availableSince||order.createdAt||order.entryDate)}</p><p>${safe(order.records?.tests||order.records?.assembly||order.records?.diagnosis||order.defect||'Atualização operacional registrada.')}</p></div>`).join('')||'<div class="empty">Nenhuma atualização.</div>'}</div></section><aside class="stack"><section class="card"><div class="card-head"><h2>Aprovações e pendências</h2></div><div class="card-body alert-list">${approvals||'<div class="empty">Nenhuma aprovação pendente.</div>'}</div></section><section class="card"><div class="card-head"><h2>Relatórios disponíveis</h2></div><div class="card-body alert-list">${orders.filter(order=>order.report?.sent).map(order=>`<div class="alert-item"><div class="alert-icon tone-blue">${icon('file')}</div><div class="grow"><strong>OS #${safe(order.number)}</strong><p>Enviado em ${formatDateTime(order.report.sentAt)}</p></div><button class="btn btn-light btn-sm" data-action="portal-report" data-id="${order.id}">${icon('download',14)} Abrir</button></div>`).join('')||'<div class="empty">Nenhum relatório disponível.</div>'}</div></section></aside></div></div>`,'portal',true,client.id);
  }

  function portalReportViewV8(orderId){
    const client=resolvePortalClientV8();
    const order=getOrder(orderId);
    if(!portalOrderAllowedV8(order,client,true))return shell(`<div class="page"><div class="access-denied-card">${icon('alert',32)}<h1>Acesso não autorizado</h1><p>Este relatório não pertence à empresa conectada ou ainda não foi enviado pela AR7.</p><a class="btn btn-primary" href="#portal/${client?.id||''}">Voltar ao dashboard</a></div></div>`,'portal',true,client?.id||'');
    return shell(`<div class="page portal-report-readonly">${pageHead(`Relatório OS ${safe(order.number)}`,'Documento disponibilizado pela AR7 em modo somente leitura.',`<a class="btn btn-light" href="#portal/${client.id}">${icon('arrow',14)} Voltar</a><button class="btn btn-primary" data-action="print-portal-report">${icon('download',14)} Salvar PDF</button>`)}<section class="pdf-shell pdf-shell-v5"><div class="pdf-toolbar"><span>${icon('file',17)}</span><span>Relatorio_AR7_OS_${safe(order.number)}.pdf</span><span class="pdf-toolbar-meta">Somente leitura</span></div>${reportDocumentV5(order)}</section></div>`,'portal',true,client.id);
  }

  function render(options={}){
    const {route,param}=parseRoute(),routeKey=`${route}/${param||''}`;
    const resetScroll=options?.resetScroll===true||Boolean(renderedRouteKeyV7&&renderedRouteKeyV7!==routeKey);
    const state=resetScroll?null:captureUIStateV7();
    const views={dashboard:dashboardView,orders:()=>ordersView(param),clients:clientsView,client:()=>clientDetailView(param),equipment:equipmentView,parts:partsView,workshop:workshopView,reports:()=>reportsView(param),portal:()=>portalView(param),'portal-report':()=>portalReportViewV8(param),settings:settingsView,order:()=>orderDetailView(param)};
    try{document.getElementById('app').innerHTML=(views[route]||notFoundView)();renderedRouteKeyV7=routeKey;requestAnimationFrame(()=>{if(resetScroll)window.scrollTo(0,0);else restoreUIStateV7(state);});}
    catch(error){console.error('Falha ao renderizar',error);document.getElementById('app').innerHTML=`<div class="fatal-error"><h1>Não foi possível abrir esta tela</h1><p>${safe(error.message)}</p><button class="btn btn-primary" onclick="location.hash='#dashboard';location.reload()">Voltar ao dashboard</button></div>`;}
  }

  function handleV8SecurityActions(event){
    const target=event.target.closest('[data-action]');if(!target)return false;
    const action=target.dataset.action;
    if(action==='install-part'){event.preventDefault();event.stopImmediatePropagation();installPartV8(target.dataset.order,target.dataset.part);return true;}
    if(action==='enter-client-portal'){event.preventDefault();event.stopImmediatePropagation();const client=getClient(target.dataset.id);if(!client)return toast('Empresa não encontrada.','error');setPortalSessionIdV8(client.id);location.hash=`#portal/${client.id}`;return true;}
    if(action==='portal-report'){event.preventDefault();event.stopImmediatePropagation();const client=resolvePortalClientV8();const order=getOrder(target.dataset.id);if(!portalOrderAllowedV8(order,client,true))return toast('Este relatório não está disponível para a empresa conectada.','error');location.hash=`#portal-report/${order.id}`;return true;}
    if(action==='portal-approve'){event.preventDefault();event.stopImmediatePropagation();const client=resolvePortalClientV8();const order=getOrder(target.dataset.id);if(!portalOrderAllowedV8(order,client,false))return toast('Esta solicitação não pertence à empresa conectada.','error');toast('Aprovação registrada para a AR7.');return true;}
    if(action==='print-portal-report'){event.preventDefault();event.stopImmediatePropagation();setTimeout(()=>window.print(),50);return true;}
    return false;
  }

  function handleV7SupplementalClick(event){
    if(handleV8SecurityActions(event))return;
    const target=event.target.closest('[data-action="apply-report-template"]');if(target){event.preventDefault();applyReportTemplateV7(target.dataset.id);}
  }

  /* =========================
     AR7 V9 — navegação de empresas, capa profissional e assinaturas visuais
     ========================= */
  let signaturePadStateV9 = null;

  function ensureSignaturesV9(order) {
    order.signatures = order.signatures || {};
    order.signatures.technicians = Array.isArray(order.signatures.technicians) ? order.signatures.technicians : [];
    order.signatures.supervisor = order.signatures.supervisor || {name:order.supervisor||'',role:'Supervisor de Manutenção',image:'',signedAt:''};
    if (!order.signatures.supervisor.name && order.supervisor && order.supervisor !== 'A definir') order.signatures.supervisor.name = order.supervisor;
    return order.signatures;
  }

  function signatureDateV9(value) {
    if (!value) return 'Assinatura pendente';
    try { return new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(new Date(value)); }
    catch { return formatDateTime(value); }
  }

  function signaturePreviewV9(signature, compact=false) {
    const signed=Boolean(signature?.image);
    return `<div class="signature-preview-v9 ${signed?'is-signed':'is-pending'} ${compact?'compact':''}">
      <div class="signature-image-box-v9">${signed?`<img src="${signature.image}" alt="Assinatura visual de ${safe(signature.name||'responsável')}">`:`<span>${icon('edit',24)}<small>Assinatura pendente</small></span>`}</div>
      <div class="signature-person-v9"><strong>${safe(signature?.name||'Nome não informado')}</strong><span>${safe(signature?.role||'Função não informada')}</span><small>${signed?`Assinado em ${signatureDateV9(signature.signedAt)}`:'Assinatura manual com mouse, toque ou caneta'}</small></div>
    </div>`;
  }

  function mountingSignaturesPanelV9(order) {
    const signatures=ensureSignaturesV9(order);
    const cards=signatures.technicians.map((signature,index)=>`<article class="signature-card-v9">${signaturePreviewV9(signature)}<div class="row-actions"><button class="btn btn-light btn-sm" data-action="edit-technician-signature" data-order="${order.id}" data-index="${index}">${icon('edit',14)} Refazer / editar</button><button class="icon-danger" data-action="remove-technician-signature" data-order="${order.id}" data-index="${index}" aria-label="Remover técnico">${icon('trash',14)}</button></div></article>`).join('');
    return `<section class="mounting-signatures-v9"><div class="stage-photo-head"><div><div class="section-eyebrow">RESPONSABILIDADE TÉCNICA · ${signatures.technicians.length} ASSINATURA(S)</div><h3>Técnicos que executaram a montagem</h3><p>Cada profissional assina manualmente. A imagem da assinatura, o nome, a função e a data serão inseridos no relatório.</p></div><button class="btn btn-primary btn-sm" data-action="add-technician-signature" data-order="${order.id}">${icon('plus',15)} Adicionar técnico e assinar</button></div><div class="signature-grid-v9">${cards||`<div class="signature-empty-v9">${icon('edit',30)}<strong>Nenhum técnico assinou a montagem</strong><span>Adicione pelo menos uma assinatura antes de liberar o equipamento para os testes.</span></div>`}</div></section>`;
  }

  function openSignatureModalV9(orderId,kind,index=-1) {
    const order=getOrder(orderId); if(!order) return toast('OS não encontrada.','error');
    const signatures=ensureSignaturesV9(order);
    const existing=kind==='supervisor'?signatures.supervisor:signatures.technicians[Number(index)]||{name:order.technician&&order.technician!=='A definir'?order.technician:'',role:'Técnico de Montagem',image:'',signedAt:''};
    signaturePadStateV9={orderId,kind,index:Number(index),drawing:false,last:null,hasInk:Boolean(existing.image),existingImage:existing.image||''};
    openModal(kind==='supervisor'?'Assinatura do supervisor':'Assinatura do técnico de montagem',`<div class="signature-modal-v9"><div class="form-grid"><div class="form-group"><label>Nome completo *</label><input class="input" id="signature-name-v9" value="${safe(existing.name||'')}" placeholder="Nome do profissional"></div><div class="form-group"><label>Cargo / função *</label><input class="input" id="signature-role-v9" value="${safe(existing.role||'')}" placeholder="Ex.: Técnico de Montagem"></div></div><div class="signature-pad-head-v9"><div><strong>Assine no quadro abaixo</strong><span>Use o mouse, o dedo ou uma caneta para tablet.</span></div><button class="btn btn-light btn-sm" data-action="clear-signature-pad-v9">Limpar</button></div><canvas id="signature-canvas-v9" width="1000" height="320" aria-label="Quadro para assinatura manual"></canvas><p class="signature-legal-v9">Assinatura visual vinculada à OS ${safe(order.number)}. Esta assinatura tem finalidade de identificação no relatório técnico e não substitui certificação ICP-Brasil.</p></div>`,`<button class="btn btn-light" data-action="close-modal">Cancelar</button><button class="btn btn-primary" data-action="save-signature-pad-v9">${icon('save')} Salvar assinatura</button>`);
    requestAnimationFrame(()=>initializeSignatureCanvasV9(existing.image||''));
  }

  function initializeSignatureCanvasV9(existingImage='') {
    const canvas=document.getElementById('signature-canvas-v9'); if(!canvas||!signaturePadStateV9) return;
    const ctx=canvas.getContext('2d'); ctx.clearRect(0,0,canvas.width,canvas.height); ctx.lineCap='round'; ctx.lineJoin='round'; ctx.strokeStyle='#171519'; ctx.lineWidth=5;
    signaturePadStateV9.canvas=canvas; signaturePadStateV9.ctx=ctx;
    if(existingImage){const img=new Image();img.onload=()=>ctx.drawImage(img,0,0,canvas.width,canvas.height);img.src=existingImage;}
  }

  function signaturePointV9(event) {
    const canvas=document.getElementById('signature-canvas-v9'); if(!canvas) return null;
    const rect=canvas.getBoundingClientRect();
    return {x:(event.clientX-rect.left)/rect.width*canvas.width,y:(event.clientY-rect.top)/rect.height*canvas.height};
  }
  function signaturePointerDownV9(event) {
    if(!signaturePadStateV9||!event.target.closest('#signature-canvas-v9')) return;
    const point=signaturePointV9(event); if(!point)return;
    signaturePadStateV9.drawing=true;signaturePadStateV9.last=point;signaturePadStateV9.hasInk=true;
    try{event.target.setPointerCapture(event.pointerId);}catch{}
    event.preventDefault();
  }
  function signaturePointerMoveV9(event) {
    if(!signaturePadStateV9?.drawing) return;
    const point=signaturePointV9(event),ctx=signaturePadStateV9.ctx,last=signaturePadStateV9.last;if(!point||!ctx||!last)return;
    ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(point.x,point.y);ctx.stroke();signaturePadStateV9.last=point;event.preventDefault();
  }
  function signaturePointerUpV9(event) {
    if(!signaturePadStateV9?.drawing)return;signaturePadStateV9.drawing=false;signaturePadStateV9.last=null;event.preventDefault();
  }
  function clearSignaturePadV9() {
    const canvas=signaturePadStateV9?.canvas,ctx=signaturePadStateV9?.ctx;if(!canvas||!ctx)return;ctx.clearRect(0,0,canvas.width,canvas.height);signaturePadStateV9.hasInk=false;signaturePadStateV9.existingImage='';
  }
  function saveSignaturePadV9() {
    const state=signaturePadStateV9,order=getOrder(state?.orderId);if(!state||!order)return;
    const name=(document.getElementById('signature-name-v9')?.value||'').trim(),role=(document.getElementById('signature-role-v9')?.value||'').trim();
    if(!name||!role)return toast('Informe o nome e a função do profissional.','error');
    if(!state.hasInk)return toast('Faça a assinatura manual no quadro antes de salvar.','error');
    const signatures=ensureSignaturesV9(order),entry={id:state.kind==='supervisor'?'supervisor':(signatures.technicians[state.index]?.id||id('sig')),name,role,image:state.canvas.toDataURL('image/png'),signedAt:new Date().toISOString()};
    if(state.kind==='supervisor'){signatures.supervisor=entry;order.supervisor=name;}
    else {if(state.index>=0)signatures.technicians[state.index]=entry;else signatures.technicians.push(entry);order.technician=signatures.technicians.map(item=>item.name).join(', ');}
    addActivity(`OS ${order.number}: assinatura de ${name} registrada.`);saveDB();signaturePadStateV9=null;closeModal();render();toast('Assinatura salva e vinculada ao relatório.');
  }

  function reportSignatureBlockV9(signature,label) {
    const signed=Boolean(signature?.image);
    return `<article class="report-signature-card-v9"><span class="report-signature-label-v9">${safe(label)}</span><div class="report-signature-image-v9">${signed?`<img src="${signature.image}" alt="Assinatura de ${safe(signature.name||'responsável')}">`:`<span>Assinatura pendente</span>`}</div><strong>${safe(signature?.name||'A definir')}</strong><small>${safe(signature?.role||'Função não informada')}</small><small>${signed?signatureDateV9(signature.signedAt):'Não assinada'}</small></article>`;
  }

  const shellBeforeV9=shell;
  shell=function(content,route,portal=false,portalClientId='') {
    const portalClient=portal?resolvePortalClientV8(portalClientId):null;
    const portalHref=portalClient?`portal/${portalClient.id}`:'portal';
    const nav=navItems(portal).map(([href,label,ico],index)=>{const actual=portal?portalHref:href;const active=portal?index===0:route===href;return `<a href="#${actual}" class="${active?'active':''}">${icon(ico)}<span>${safe(label)}</span></a>`;}).join('');
    const brandHref=portal?`#${portalHref}`:'#dashboard';
    const brandAction=portal?'go-portal-dashboard-v9':'go-admin-dashboard-v9';
    const brandLabel=portal?'Ir para o dashboard desta empresa':'Ir para o dashboard principal da AR7';
    return `<div class="app-shell ${portal?'portal-shell':''}"><aside class="sidebar" id="sidebar"><a class="brand" href="${brandHref}" data-action="${brandAction}" data-client="${portalClient?.id||''}" aria-label="${brandLabel}" title="${brandLabel}"><span class="brand-logo-wrap"><img src="./assets/ar7-logo.png" alt="AR7 Elétrica"></span><small class="brand-subtitle">${portal?'Acompanhamento dos serviços':'Gestão de oficina, peças e relatórios'}</small></a><nav class="nav">${nav}</nav><div class="sidebar-foot"><div class="machine">${portal?'🏭':'⚡'}</div><div><strong>${safe(portal?portalClient?.name||'Cliente':db.company.name)}</strong><small>${portal?'Acesso exclusivo da empresa':safe(db.company.unit)}</small><div class="sidebar-live"><span class="status-dot"></span>${portal?'Dados isolados e sincronizados':'Unidade ativa'}</div></div></div></aside><div class="sidebar-overlay" id="sidebar-overlay" hidden></div><main class="main"><header class="topbar"><button class="menu-btn" data-action="toggle-menu" aria-label="Abrir menu">${icon('menu',24)}</button><div class="live-sync-indicator"><span></span>${portal?'Acompanhamento atualizado':'Operação atualizada'}</div><div class="top-actions"><button class="top-icon" aria-label="Notificações">${icon('bell')}<span>5</span></button><button class="top-icon" aria-label="Ajuda">${icon('help')}</button>${portal?'':`<button class="workspace">⚡ ${safe(db.company.name)} <small>v10</small> ▾</button>`}</div></header>${content}</main></div>`;
  };

  const clientsViewBeforeV9=clientsView;
  clientsView=function(){
    const html=clientsViewBeforeV9();
    return html.replace('<div class="page">','<div class="page"><div class="page-backbar-v9"><button type="button" class="btn btn-light btn-sm" data-action="go-admin-dashboard-v9">← Voltar ao dashboard</button><span>Empresas atendidas pela AR7</span></div>');
  };
  const clientDetailViewBeforeV9=clientDetailView;
  clientDetailView=function(clientId){
    const html=clientDetailViewBeforeV9(clientId);
    return html.replace('<div class="page">','<div class="page"><div class="page-backbar-v9"><button type="button" class="btn btn-light btn-sm" data-action="go-admin-dashboard-v9">← Voltar ao dashboard</button><a class="btn btn-light btn-sm" href="#clients">Voltar para empresas</a></div>');
  };

  const currentStageWorkspaceBeforeV9=currentStageWorkspace;
  currentStageWorkspace=function(order){
    if(order.stage!=='montagem')return currentStageWorkspaceBeforeV9(order);
    const records=order.records||{};
    return `<section class="card stage-workspace"><div class="card-head"><div><h2>Montagem do equipamento</h2><p>Serviço, responsáveis, assinaturas e fotos ficam registrados na mesma etapa.</p></div></div><div class="card-body stack"><div class="form-group"><label for="stage-record">Serviços executados na montagem *</label><textarea class="textarea stage-large-text" id="stage-record" placeholder="Peças instaladas, ajustes, torque, alinhamento, folgas e observações...">${safe(records.assembly||'')}</textarea></div>${mountingSignaturesPanelV9(order)}${photoGalleryV5(order,'assembly','Fotos durante a montagem','Registre peças instaladas, ajustes, alinhamento e fechamento do equipamento.')}${partsTableV5(order,false)}</div></section>`;
  };

  const stageRequirementsBeforeV9=stageRequirements;
  stageRequirements=function(order){
    const requirements=stageRequirementsBeforeV9(order),signatures=ensureSignaturesV9(order);
    if(order.stage==='montagem')requirements.push({label:'Assinatura de pelo menos um técnico de montagem',ok:signatures.technicians.some(item=>Boolean(item.image))});
    if(order.stage==='relatorio')requirements.push({label:'Assinatura visual do supervisor registrada',ok:Boolean(signatures.supervisor?.image)});
    return requirements;
  };

  const reportChecklistBeforeV9=reportChecklist;
  reportChecklist=function(order){
    const list=reportChecklistBeforeV9(order),signatures=ensureSignaturesV9(order);
    const without=list.filter(item=>!String(item.label||'').toLowerCase().includes('assinatura'));
    without.push({label:'Assinatura da equipe de montagem',detail:'Pelo menos um técnico deve assinar manualmente.',ok:signatures.technicians.some(item=>Boolean(item.image))});
    without.push({label:'Assinatura do supervisor',detail:'A aprovação exige a assinatura manual do supervisor.',ok:Boolean(signatures.supervisor?.image)});
    return without;
  };
  reportReady=function(order){return reportChecklist(order).every(item=>item.ok);};

  reportPhotoSvgV7=function(photo,className='') {
    const p=normalizePhotoV5(photo),width=Math.max(1,p.width||1200),height=Math.max(1,p.height||800);
    return `<div class="report-photo-media ${className}"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${safe(p.caption||'Evidência fotográfica')}"><rect width="${width}" height="${height}" fill="#f2f0f1"/><image href="${safe(p.src)}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet"/>${(p.annotations||[]).map(a=>scaledArrowMarkupV7(a,width,height)).join('')}</svg></div>`;
  };
  reportPageCount=function(order){return 5+['before','during','assembly','after'].reduce((total,group)=>total+Math.ceil((order.photos?.[group]?.length||0)/2),0);};

  reportDocumentV5=function(order) {
    const client=getClient(order.clientId),eq=getEquipment(order.equipmentId),texts=professionalReportTextV7(order),signatures=ensureSignaturesV9(order);
    const equipmentPhoto=(order.photos.after||[])[0]||(order.photos.before||[])[0]||null;
    const measurements=(order.measurements||[]).map(m=>`<tr><td>${safe(m.name)}</td><td>${safe(m.unit)}</td><td>${safe(m.before)}</td><td>${safe(m.after)}</td><td>${safe(m.limit)}</td><td>${safe(m.status||'Registrado')}</td></tr>`).join('');
    const parts=(order.parts||[]).map(p=>`<tr><td>${safe(p.name)}</td><td>${safe(p.position||'—')}</td><td>${safe(p.code||'—')}</td><td>${safe(p.dimensions||'—')}</td><td>${safe(partQuantity(p))}</td><td>${safe(p.status||'—')}</td></tr>`).join('');
    const documentCode=`RT-AR7-${safe(order.number)}`;
    const techBlocks=signatures.technicians.map((signature,index)=>reportSignatureBlockV9(signature,`Técnico de montagem ${index+1}`)).join('')||reportSignatureBlockV9({name:order.technician||'A definir',role:'Técnico de Montagem'},'Técnico de montagem');
    return `<div class="report-document" id="printable-report">
      <section class="report-page report-cover report-cover-v9"><div class="cover-v9-accent"></div><div class="cover-v9-top"><img src="./assets/ar7-logo.png" alt="AR7 Elétrica"><div><span>${documentCode}</span><strong>DOCUMENTO TÉCNICO CONTROLADO</strong></div></div><div class="cover-v9-main"><span class="cover-v9-kicker">MANUTENÇÃO ELETROMECÂNICA</span><h1>Relatório Técnico<br>de Manutenção</h1><div class="cover-v9-os">OS <strong>${safe(order.number)}</strong></div><h2>${safe(equipmentDescription(eq))}</h2><p>Registro técnico da inspeção, intervenção, montagem, testes e evidências associadas à ordem de serviço.</p></div><div class="cover-v9-bottom"><div class="cover-v9-data"><div><span>Empresa atendida</span><strong>${safe(client?.name||'—')}</strong></div><div><span>Identificação do equipamento</span><strong>${safe(eq?.tag||'Sem TAG')} · ${safe(eq?.serial||'Série não informada')}</strong></div><div><span>Entrada</span><strong>${formatDate(order.entryDate)}</strong></div><div><span>Prazo previsto</span><strong>${formatDate(order.dueDate)}</strong></div></div>${equipmentPhoto?`<figure class="cover-v9-equipment-photo">${reportPhotoSvgV7(equipmentPhoto)}<figcaption>Registro do equipamento vinculado à OS</figcaption></figure>`:`<div class="cover-v9-no-photo">${icon('motor',42)}<span>Relatório emitido sem imagem de capa</span></div>`}</div><div class="cover-v9-note">A imagem de capa, quando disponível, corresponde exclusivamente ao equipamento vinculado à ordem de serviço.</div><div class="report-footer"><span>AR7 Elétrica · ${documentCode}</span><span>Emissão ${new Intl.DateTimeFormat('pt-BR',{dateStyle:'long'}).format(new Date())}</span></div></section>
      <section class="report-page"><div class="report-page-header"><img src="./assets/ar7-logo.png" alt="AR7"><div><span>${documentCode}</span><strong>Identificação, objetivo e critérios</strong></div></div><div class="report-info-grid"><article><span>Empresa atendida</span><strong>${safe(client?.name||'—')}</strong><p>${safe(client?.contact||'Contato não informado')} · ${safe(client?.email||'E-mail não informado')}</p></article><article><span>Equipamento</span><strong>${safe(equipmentDescription(eq))}</strong><p>${safe(eq?.tag||'Sem TAG')} · ${safe(eq?.manufacturer||'Fabricante não informado')} · ${safe(eq?.power||'Potência não informada')}</p></article><article><span>Defeito informado</span><p>${safe(order.defect||'Não informado')}</p></article><article><span>Condição no recebimento</span><p>${safe(order.reception?.condition||'Não informada')}</p></article></div><div class="report-text-section"><h2>1. Objetivo e escopo</h2><p>${safe(texts.scope)}</p></div><div class="report-text-section"><h2>2. Critérios de avaliação</h2><p>${safe(texts.method)}</p></div><div class="report-standard-note"><strong>Nota técnica:</strong> os resultados refletem as condições encontradas e os ensaios realizados no momento da manutenção. Alterações posteriores de instalação, carga ou operação não estão contempladas.</div><div class="report-footer"><span>${documentCode}</span><span>Identificação e escopo</span></div></section>
      <section class="report-page"><div class="report-page-header"><img src="./assets/ar7-logo.png" alt="AR7"><div><span>${documentCode}</span><strong>Diagnóstico, intervenção e conclusão</strong></div></div><div class="report-text-section"><h2>3. Diagnóstico técnico</h2><p>${safe(texts.diagnosis)}</p></div><div class="report-text-section"><h2>4. Serviços executados</h2><p>${safe(texts.assembly)}</p></div><div class="report-text-section"><h2>5. Testes e verificações finais</h2><p>${safe(texts.tests)}</p></div><div class="report-text-section conclusion"><h2>6. Conclusão técnica</h2><p>${safe(texts.conclusion)}</p></div><div class="report-text-section recommendations"><h2>7. Recomendações</h2><p>${safe(texts.recommendations)}</p></div><div class="report-footer"><span>${documentCode}</span><span>Diagnóstico e conclusão</span></div></section>
      <section class="report-page"><div class="report-page-header"><img src="./assets/ar7-logo.png" alt="AR7"><div><span>${documentCode}</span><strong>Componentes, medições e resultados</strong></div></div><h2 class="report-section-title">8. Componentes e materiais registrados</h2><table class="report-table"><thead><tr><th>Peça</th><th>Aplicação</th><th>Código</th><th>Medidas</th><th>Quantidade</th><th>Status</th></tr></thead><tbody>${parts||'<tr><td colspan="6">Serviço sem peças registradas.</td></tr>'}</tbody></table><h2 class="report-section-title">9. Medições e resultados</h2><table class="report-table"><thead><tr><th>Parâmetro</th><th>Unidade</th><th>Antes</th><th>Depois</th><th>Limite</th><th>Resultado</th></tr></thead><tbody>${measurements||'<tr><td colspan="6">Nenhuma medição registrada.</td></tr>'}</tbody></table><div class="report-result-legend"><span><i class="ok"></i> Resultado conforme registro</span><span><i></i> Avaliar em conjunto com a conclusão técnica</span></div><div class="report-footer"><span>${documentCode}</span><span>Componentes e medições</span></div></section>
      <section class="report-page report-signature-page-v9"><div class="report-page-header"><img src="./assets/ar7-logo.png" alt="AR7"><div><span>${documentCode}</span><strong>Responsáveis e assinaturas</strong></div></div><div class="report-text-section"><h2>10. Declaração de responsabilidade</h2><p>Os profissionais abaixo declaram que os registros deste relatório correspondem às atividades executadas, às verificações realizadas e às condições observadas durante a ordem de serviço.</p></div><h2 class="report-section-title">Equipe responsável pela montagem</h2><div class="report-signature-grid-v9">${techBlocks}</div><h2 class="report-section-title supervisor-title-v9">Revisão e aprovação</h2><div class="report-signature-grid-v9 supervisor-grid-v9">${reportSignatureBlockV9(signatures.supervisor,'Supervisor responsável')}</div><div class="report-signature-note-v9">Assinaturas visuais capturadas no sistema por mouse, toque ou caneta. Nome, função, data e imagem da assinatura ficam vinculados à ordem de serviço.</div><div class="report-footer"><span>${documentCode}</span><span>Responsáveis e assinaturas</span></div></section>
      ${reportPhotoSection('Recebimento',order.photos.before||[],order.number)}${reportPhotoSection('Diagnóstico e desmontagem',order.photos.during||[],order.number)}${reportPhotoSection('Montagem',order.photos.assembly||[],order.number)}${reportPhotoSection('Equipamento finalizado',order.photos.after||[],order.number)}
    </div>`;
  };

  reportDetailView=function(orderId) {
    const order=getOrder(orderId);if(!order)return notFoundView();order.records=order.records||{diagnosis:'',assembly:'',tests:'',conclusion:'',recommendations:''};
    const checks=reportChecklist(order),ready=reportReady(order),texts=professionalReportTextV7(order),signatures=ensureSignaturesV9(order);
    const techList=signatures.technicians.map(item=>signaturePreviewV9(item,true)).join('')||'<div class="signature-empty-inline-v9">Nenhum técnico assinou a montagem.</div>';
    return shell(`<div class="page report-generator-page">${pageHead('Gerador de Relatório Técnico','Revise o conteúdo, confira a capa e conclua as assinaturas antes de aprovar.',`<button class="btn btn-light" data-action="apply-report-template" data-id="${order.id}">${icon('file')} Aplicar textos padrão</button><button class="btn btn-light" data-action="save-report-data" data-id="${order.id}">${icon('save')} Salvar</button><button class="btn btn-primary" data-action="print-report" data-id="${order.id}">${icon('download')} Gerar / salvar PDF</button>`)}<div class="grid report-layout-v5"><aside class="stack report-editor-panel"><section class="card"><div class="card-head"><div><h2>Conteúdo final</h2><p>Revise os textos antes da aprovação.</p></div></div><div class="card-body stack"><div class="form-group"><label>Conclusão técnica *</label><textarea class="textarea report-editor-text" id="report-conclusion" placeholder="Conclusão final, condição do equipamento e liberação...">${safe(order.records.conclusion||'')}</textarea><small>Sugestão: ${safe(texts.conclusion)}</small></div><div class="form-group"><label>Recomendações</label><textarea class="textarea" id="report-recommendations" placeholder="Recomendações preventivas e operacionais...">${safe(order.records.recommendations||'')}</textarea></div><div class="form-group"><label>Destinatário</label><input class="input" id="report-recipient" type="email" value="${safe(order.report.recipient||'')}"></div></div></section><section class="card"><div class="card-head"><div><h2>Assinaturas</h2><p>Mesmo padrão visual usado no EngiLaudos: assinatura desenhada, não nome digitado.</p></div></div><div class="card-body stack"><div><div class="section-eyebrow">TÉCNICOS DE MONTAGEM</div><div class="signature-list-inline-v9">${techList}</div></div><div><div class="section-eyebrow">SUPERVISOR</div>${signaturePreviewV9(signatures.supervisor,true)}<button class="btn btn-primary" data-action="sign-supervisor-v9" data-order="${order.id}">${icon('edit')} ${signatures.supervisor.image?'Refazer assinatura do supervisor':'Assinar como supervisor'}</button></div></div></section><section class="card"><div class="card-head"><h2>Checklist de qualidade</h2></div><div class="card-body alert-list">${checks.map(c=>`<div class="alert-item"><div class="alert-icon ${c.ok?'tone-blue':'tone-red'}">${icon(c.ok?'check':'alert',16)}</div><div><strong>${safe(c.label)}</strong><p>${safe(c.detail)}</p></div></div>`).join('')}</div></section><section class="card"><div class="card-body stack"><button class="btn ${(ready||order.report.approved)?'btn-success':'btn-light readiness-pending-v202'}" data-action="approve-report" data-id="${order.id}" ${order.report.approved||!ready?'disabled':''}>${icon((ready||order.report.approved)?'check':'clock')} ${order.report.approved?'Relatório aprovado':ready?'Pronto: aprovar relatório':'Concluir checklist para aprovar'}</button><button class="btn ${order.report.approved?'btn-success':'btn-light readiness-pending-v202'}" data-action="send-report" data-id="${order.id}" ${!order.report.approved?'disabled':''}>${icon(order.report.approved?'send':'clock')} ${order.report.approved?'Pronto: enviar ao cliente':'Aguardando aprovação do relatório'}</button><div class="form-group"><label>Agendar envio</label><input class="input" type="datetime-local" id="schedule-at" value="${order.report.scheduledAt||''}"><button class="btn btn-light" data-action="schedule-report" data-id="${order.id}">${icon('clock')} Agendar</button></div></div></section></aside><section class="pdf-shell pdf-shell-v5" data-preserve-scroll="report-preview"><div class="pdf-toolbar"><span>${icon('file',17)}</span><span>Relatorio_AR7_OS_${safe(order.number)}.pdf</span><span class="pdf-toolbar-meta">${reportPageCount(order)} páginas · capa V10 · assinaturas visuais</span></div>${reportDocumentV5(order)}</section></div></div>`,'reports');
  };

  const handleV8SecurityActionsBeforeV9=handleV8SecurityActions;
  handleV8SecurityActions=function(event){
    const target=event.target.closest('[data-action]');if(!target)return false;const action=target.dataset.action;
    if(action==='go-admin-dashboard-v9'){event.preventDefault();event.stopImmediatePropagation();setPortalSessionIdV8('');if(location.hash==='#dashboard')render({resetScroll:true});else location.hash='#dashboard';return true;}
    if(action==='go-portal-dashboard-v9'){event.preventDefault();event.stopImmediatePropagation();const clientId=target.dataset.client||getPortalSessionIdV8();if(clientId)setPortalSessionIdV8(clientId);const next=`#portal/${clientId}`;if(location.hash===next)render({resetScroll:true});else location.hash=next;return true;}
    if(action==='add-technician-signature'){event.preventDefault();event.stopImmediatePropagation();openSignatureModalV9(target.dataset.order,'technician',-1);return true;}
    if(action==='edit-technician-signature'){event.preventDefault();event.stopImmediatePropagation();openSignatureModalV9(target.dataset.order,'technician',Number(target.dataset.index));return true;}
    if(action==='remove-technician-signature'){event.preventDefault();event.stopImmediatePropagation();const order=getOrder(target.dataset.order);if(!order)return true;ensureSignaturesV9(order).technicians.splice(Number(target.dataset.index),1);order.technician=order.signatures.technicians.map(item=>item.name).join(', ')||'A definir';saveDB();render();toast('Técnico removido da equipe de montagem.');return true;}
    if(action==='sign-supervisor-v9'){event.preventDefault();event.stopImmediatePropagation();openSignatureModalV9(target.dataset.order,'supervisor',0);return true;}
    if(action==='clear-signature-pad-v9'){event.preventDefault();event.stopImmediatePropagation();clearSignaturePadV9();return true;}
    if(action==='save-signature-pad-v9'){event.preventDefault();event.stopImmediatePropagation();saveSignaturePadV9();return true;}
    return handleV8SecurityActionsBeforeV9(event);
  };


  /* =========================
     AR7 V10 — aprovação do cliente integrada a Compras
     ========================= */
  const APPROVAL_STATUS_V10 = {
    DRAFT:'Não enviado',
    WAITING:'Aguardando aprovação',
    APPROVED:'Aprovado',
    ADJUSTMENT:'Ajuste solicitado',
    REJECTED:'Recusado',
    WAIVED:'Dispensado'
  };

  function ensureApprovalV10(order) {
    const progressed=['pecas','montagem','testes','relatorio','concluida'].includes(order.stage);
    order.approval={
      required:true,
      status:progressed?APPROVAL_STATUS_V10.APPROVED:APPROVAL_STATUS_V10.DRAFT,
      scope:'', amount:'', terms:'', recipient:getClient(order.clientId)?.email||'',
      sentAt:'', decidedAt:'', decidedBy:'', decisionChannel:'', clientComment:'', validUntil:'',
      waiverReason:'', waivedBy:'', internalAuthorization:false,
      ...(order.approval||{})
    };
    if(order.approval.required===false && ![APPROVAL_STATUS_V10.WAIVED,APPROVAL_STATUS_V10.APPROVED].includes(order.approval.status)) order.approval.status=APPROVAL_STATUS_V10.WAIVED;
    return order.approval;
  }

  function normalizeApprovalDataV10(parsed) {
    if(!parsed?.orders)return parsed;
    parsed.version=10;
    parsed.orders.forEach(order=>ensureApprovalV10(order));
    return parsed;
  }

  const normalizeAfterLoadBeforeV10=normalizeAfterLoadV5;
  normalizeAfterLoadV5=function(parsed){return normalizeApprovalDataV10(normalizeAfterLoadBeforeV10(parsed));};
  db=normalizeApprovalDataV10(db);
  saveDB();

  function approvalGrantedV10(order) {
    const approval=ensureApprovalV10(order);
    return approval.required===false || approval.internalAuthorization===true || [APPROVAL_STATUS_V10.APPROVED,APPROVAL_STATUS_V10.WAIVED].includes(approval.status);
  }
  function approvalPendingV10(order) {
    const approval=ensureApprovalV10(order);
    return approval.required!==false && !approvalGrantedV10(order);
  }
  function approvalToneV10(status) {
    if([APPROVAL_STATUS_V10.APPROVED,APPROVAL_STATUS_V10.WAIVED].includes(status))return 'green';
    if(status===APPROVAL_STATUS_V10.WAITING)return 'amber';
    if([APPROVAL_STATUS_V10.REJECTED,APPROVAL_STATUS_V10.ADJUSTMENT].includes(status))return 'red';
    return 'gray';
  }
  function approvalLabelV10(order){return ensureApprovalV10(order).status;}
  function approvalMoneyV10(value){const number=Number(String(value||'').replace(',','.'));return Number.isFinite(number)&&number>0?number.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}):'Valor a definir';}
  function approvalSummaryV10(order) {
    const approval=ensureApprovalV10(order);
    return `<div class="approval-summary-v10"><div><span>Status do cliente</span>${badge(approval.status,approvalToneV10(approval.status))}</div><div><span>Valor apresentado</span><strong>${safe(approvalMoneyV10(approval.amount))}</strong></div><div><span>Enviado em</span><strong>${approval.sentAt?formatDateTime(approval.sentAt):'Ainda não enviado'}</strong></div><div><span>Decisão</span><strong>${approval.decidedAt?`${safe(approval.decidedBy||'Cliente')} · ${formatDateTime(approval.decidedAt)}`:'Pendente'}</strong></div></div>`;
  }

  const stageToneBeforeV10=stageTone;
  stageTone=function(stage){return stage==='aprovacao'?'amber':stageToneBeforeV10(stage);};

  const nextStageForOrderBeforeV10=nextStageForOrder;
  nextStageForOrder=function(order) {
    if(order.stage==='diagnostico') {
      const approval=ensureApprovalV10(order);
      if(approval.required===false)return order.noPartsRequired?STAGES.find(s=>s.id==='montagem'):STAGES.find(s=>s.id==='pecas');
      return STAGES.find(s=>s.id==='aprovacao');
    }
    if(order.stage==='aprovacao')return order.noPartsRequired||(order.parts||[]).length===0?STAGES.find(s=>s.id==='montagem'):STAGES.find(s=>s.id==='pecas');
    return nextStageForOrderBeforeV10(order);
  };

  const handoffButtonLabelBeforeV10=handoffButtonLabelV5;
  handoffButtonLabelV5=function(order){
    if(order.stage==='diagnostico')return ensureApprovalV10(order).required===false?(order.noPartsRequired?'Concluir diagnóstico e liberar Montagem':'Concluir diagnóstico e liberar Compras'):'Concluir diagnóstico e preparar aprovação';
    if(order.stage==='aprovacao')return order.noPartsRequired||(order.parts||[]).length===0?'Aprovação confirmada: liberar Montagem':'Aprovação confirmada: liberar Compras';
    return handoffButtonLabelBeforeV10(order);
  };

  function collectApprovalFieldsV10(order) {
    const approval=ensureApprovalV10(order);
    const read=(id,fallback='')=>document.getElementById(id)?.value??fallback;
    approval.scope=String(read('approval-scope-v10',approval.scope)).trim();
    approval.amount=String(read('approval-amount-v10',approval.amount)).trim();
    approval.terms=String(read('approval-terms-v10',approval.terms)).trim();
    approval.recipient=String(read('approval-recipient-v10',approval.recipient)).trim();
    approval.validUntil=String(read('approval-valid-until-v10',approval.validUntil)).trim();
    return approval;
  }

  const saveStageDataBeforeV10=saveStageData;
  saveStageData=function(order,notify=true){
    if(order?.stage==='aprovacao')collectApprovalFieldsV10(order);
    return saveStageDataBeforeV10(order,notify);
  };

  const stageRequirementsBeforeV10=stageRequirements;
  stageRequirements=function(order){
    const approval=ensureApprovalV10(order),parts=order.parts||[];
    if(order.stage==='aprovacao')return [
      {label:'Escopo técnico preparado para o cliente',ok:Boolean(approval.scope?.trim().length>=10)},
      {label:'Destinatário da aprovação informado',ok:Boolean(approval.recipient?.includes('@'))},
      {label:'Aprovação do cliente registrada ou formalmente dispensada',ok:approvalGrantedV10(order)}
    ];
    const list=stageRequirementsBeforeV10(order);
    if(order.stage==='pecas')list.unshift({label:'Cliente aprovou o serviço antes da compra',ok:approvalGrantedV10(order)});
    if(order.stage==='montagem')list.unshift({label:'Cliente aprovou o escopo antes da montagem',ok:approvalGrantedV10(order)});
    return list;
  };

  function approvalWorkspaceV10(order) {
    const approval=ensureApprovalV10(order),client=getClient(order.clientId),eq=getEquipment(order.equipmentId);
    const canSend=Boolean(approval.scope?.trim().length>=10&&approval.recipient?.includes('@'));
    const processSteps=[
      ['Diagnóstico técnico','Concluído','done'],
      ['Cotação de materiais','Pode ocorrer em paralelo','active'],
      ['Decisão do cliente',approval.status,approvalGrantedV10(order)?'done':approval.status===APPROVAL_STATUS_V10.WAITING?'active':'pending'],
      ['Compra e montagem',approvalGrantedV10(order)?'Liberadas conforme materiais':'Bloqueadas','pending']
    ];
    return `<section class="card stage-workspace approval-workspace-v10"><div class="card-head"><div><div class="section-eyebrow">APROVAÇÃO COMERCIAL E TÉCNICA</div><h2>Aguardando decisão do cliente</h2><p>Compras pode levantar preços e colocar os itens em cotação enquanto o cliente analisa. Comprar e iniciar a montagem só é permitido após a aprovação.</p></div>${badge(approval.status,approvalToneV10(approval.status))}</div><div class="card-body stack">
      <div class="approval-process-v10">${processSteps.map(([title,text,state],index)=>`<div class="approval-process-item ${state}"><span>${index+1}</span><div><strong>${safe(title)}</strong><small>${safe(text)}</small></div></div>`).join('')}</div>
      ${approvalSummaryV10(order)}
      ${approval.status===APPROVAL_STATUS_V10.ADJUSTMENT||approval.status===APPROVAL_STATUS_V10.REJECTED?`<div class="approval-client-message-v10">${icon('alert',20)}<div><strong>Retorno do cliente</strong><p>${safe(approval.clientComment||'O cliente solicitou revisão da proposta.')}</p></div></div>`:''}
      <div class="form-grid approval-form-v10"><div class="form-group span-2"><label>Escopo enviado para aprovação *</label><textarea class="textarea stage-large-text" id="approval-scope-v10" placeholder="Descreva os serviços, peças e condições que o cliente está aprovando...">${safe(approval.scope||'')}</textarea></div><div class="form-group"><label>Valor estimado</label><input class="input" id="approval-amount-v10" inputmode="decimal" value="${safe(approval.amount||'')}" placeholder="Ex.: 4850,00"></div><div class="form-group"><label>Validade da proposta</label><input class="input" type="date" id="approval-valid-until-v10" value="${safe(approval.validUntil||'')}"></div><div class="form-group span-2"><label>Condições e prazo</label><textarea class="textarea" id="approval-terms-v10" placeholder="Prazo após aprovação, condições comerciais, observações...">${safe(approval.terms||'')}</textarea></div><div class="form-group span-2"><label>E-mail do cliente *</label><input class="input" type="email" id="approval-recipient-v10" value="${safe(approval.recipient||client?.email||'')}"></div></div>
      <div class="approval-actions-v10"><button class="btn btn-light" data-action="save-approval-v10" data-id="${order.id}">${icon('save')} Salvar rascunho</button><button class="btn btn-primary" data-action="send-approval-v10" data-id="${order.id}">${icon('send')} Enviar para aprovação</button><button class="btn btn-success" data-action="manual-approval-v10" data-id="${order.id}">${icon('check')} Registrar aprovação recebida</button><button class="btn btn-light" data-action="waive-approval-v10" data-id="${order.id}">Dispensar aprovação</button></div>
      <section class="approval-quote-parallel-v10"><div class="stage-photo-head"><div><div class="section-eyebrow">COTAÇÃO EM PARALELO</div><h3>Peças levantadas no diagnóstico</h3><p>Compras pode informar fornecedor, preço e avançar até “Em cotação”. O botão de compra será liberado automaticamente após a decisão do cliente.</p></div><a class="btn btn-light btn-sm" href="#parts">Abrir central de Compras ${icon('arrow',14)}</a></div>${partsTableV5(order,true)}</section>
      <div class="approval-context-v10"><strong>OS #${safe(order.number)} · ${safe(client?.name||'Cliente')}</strong><span>${safe(eq?.tag||'Sem TAG')} · ${safe(equipmentDescription(eq))}</span></div>
    </div></section>`;
  }

  const currentStageWorkspaceBeforeV10=currentStageWorkspace;
  currentStageWorkspace=function(order){return order.stage==='aprovacao'?approvalWorkspaceV10(order):currentStageWorkspaceBeforeV10(order);};

  function moveAfterApprovalV10(order,source='Cliente') {
    if(order.stage!=='aprovacao')return;
    const target=nextStageForOrder(order);if(!target)return;
    const from=STAGES.find(stage=>stage.id==='aprovacao');
    order.handoffs=order.handoffs||[];
    order.handoffs.push({fromStage:'aprovacao',toStage:target.id,fromTeam:from?.team||'Comercial / Cliente',toTeam:target.team,at:new Date().toISOString(),note:`Aprovação registrada por ${source}.`});
    order.stage=target.id;order.availableSince=new Date().toISOString();
    addActivity(`OS ${order.number}: aprovação confirmada por ${source}; processo liberado para ${target.team}.`);
  }

  function saveApprovalDraftV10(orderId,notify=true) {
    const order=getOrder(orderId);if(!order)return;
    const approval=collectApprovalFieldsV10(order);
    if(approval.status===APPROVAL_STATUS_V10.ADJUSTMENT||approval.status===APPROVAL_STATUS_V10.REJECTED)approval.status=APPROVAL_STATUS_V10.DRAFT;
    saveDB();render();if(notify)toast('Rascunho da aprovação salvo.');
  }
  function sendApprovalV10(orderId) {
    const order=getOrder(orderId);if(!order)return;
    const approval=collectApprovalFieldsV10(order);
    if(approval.scope.trim().length<10)return toast('Descreva o escopo que será aprovado pelo cliente.','error');
    if(!approval.recipient.includes('@'))return toast('Informe um e-mail válido do cliente.','error');
    approval.status=APPROVAL_STATUS_V10.WAITING;approval.sentAt=new Date().toISOString();approval.decidedAt='';approval.decidedBy='';approval.clientComment='';
    addActivity(`OS ${order.number}: proposta enviada para aprovação de ${approval.recipient}.`);saveDB();render();toast('Proposta registrada como enviada. O cliente já pode aprovar no portal.');
  }

  function openManualApprovalModalV10(orderId) {
    const order=getOrder(orderId);if(!order)return;const approval=collectApprovalFieldsV10(order);
    openModal('Registrar aprovação recebida',`<div class="stack"><div class="approval-modal-summary-v10">${icon('check',24)}<div><strong>OS #${safe(order.number)}</strong><p>${safe(approval.scope||'Escopo ainda não preenchido')}</p><span>${safe(approvalMoneyV10(approval.amount))}</span></div></div><div class="form-grid"><div class="form-group"><label>Nome de quem aprovou *</label><input class="input" id="approval-decision-by-v10" placeholder="Nome do responsável do cliente"></div><div class="form-group"><label>Canal da aprovação *</label><select class="select" id="approval-channel-v10"><option value="Portal do Cliente">Portal do Cliente</option><option value="E-mail">E-mail</option><option value="Pedido de compra">Pedido de compra</option><option value="WhatsApp / telefone">WhatsApp / telefone</option><option value="Contrato / autorização prévia">Contrato / autorização prévia</option></select></div><div class="form-group span-2"><label>Observação ou referência</label><textarea class="textarea" id="approval-decision-note-v10" placeholder="Número do pedido, mensagem recebida, condição aprovada..."></textarea></div></div></div>`,`<button class="btn btn-light" data-action="close-modal">Cancelar</button><button class="btn btn-success" data-action="confirm-manual-approval-v10" data-id="${order.id}">${icon('check')} Confirmar aprovação</button>`);
  }
  function confirmManualApprovalV10(orderId) {
    const order=getOrder(orderId);if(!order)return;const approval=ensureApprovalV10(order);
    if((approval.scope||'').trim().length<10)return toast('Preencha e salve o escopo antes de registrar a aprovação.','error');
    const by=(document.getElementById('approval-decision-by-v10')?.value||'').trim();if(!by)return toast('Informe quem aprovou.','error');
    approval.status=APPROVAL_STATUS_V10.APPROVED;approval.decidedAt=new Date().toISOString();approval.decidedBy=by;approval.decisionChannel=document.getElementById('approval-channel-v10')?.value||'Registro manual';approval.clientComment=(document.getElementById('approval-decision-note-v10')?.value||'').trim();
    moveAfterApprovalV10(order,`${by} (${approval.decisionChannel})`);saveDB();closeModal();render();toast('Aprovação registrada e próxima equipe liberada.');
  }
  function openWaiveApprovalModalV10(orderId) {
    const order=getOrder(orderId);if(!order)return;
    openModal('Dispensar aprovação do cliente',`<div class="stack"><div class="approval-warning-v10">${icon('alert',22)}<div><strong>Use apenas quando houver contrato, garantia ou autorização prévia.</strong><p>A justificativa ficará registrada no histórico da OS e no relatório.</p></div></div><div class="form-grid"><div class="form-group"><label>Supervisor responsável *</label><input class="input" id="approval-waived-by-v10" value="${safe(order.supervisor||'')}"></div><div class="form-group span-2"><label>Justificativa obrigatória *</label><textarea class="textarea" id="approval-waiver-reason-v10" placeholder="Ex.: serviço coberto por contrato mensal, garantia, autorização permanente..."></textarea></div></div></div>`,`<button class="btn btn-light" data-action="close-modal">Cancelar</button><button class="btn btn-primary" data-action="confirm-waive-approval-v10" data-id="${order.id}">Registrar dispensa</button>`);
  }
  function confirmWaiveApprovalV10(orderId) {
    const order=getOrder(orderId);if(!order)return;const approval=ensureApprovalV10(order);
    const by=(document.getElementById('approval-waived-by-v10')?.value||'').trim(),reason=(document.getElementById('approval-waiver-reason-v10')?.value||'').trim();
    if(!by||reason.length<10)return toast('Informe supervisor e uma justificativa completa.','error');
    approval.required=false;approval.status=APPROVAL_STATUS_V10.WAIVED;approval.waivedBy=by;approval.waiverReason=reason;approval.decidedAt=new Date().toISOString();approval.decidedBy=by;approval.decisionChannel='Dispensa interna autorizada';
    moveAfterApprovalV10(order,`dispensa autorizada por ${by}`);saveDB();closeModal();render();toast('Dispensa registrada e fluxo liberado.');
  }

  const advancePartBeforeV10=advancePart;
  advancePart=function(orderId,partId){
    const order=getOrder(orderId),part=order?.parts?.find(item=>item.id===partId);if(!order||!part)return;
    const next=purchaseNextStatusV8(part.status);
    if(next==='Comprada'&&!approvalGrantedV10(order))return toast('Cotação permitida, mas a compra está bloqueada até a aprovação do cliente.','error');
    return advancePartBeforeV10(orderId,partId);
  };

  function approvalColumnV10(order) {
    const approval=ensureApprovalV10(order);
    return `<div class="approval-table-status-v10">${badge(approval.status,approvalToneV10(approval.status))}<small>${approvalGrantedV10(order)?'Compra liberada':'Somente cotação liberada'}</small></div>`;
  }

  partsView=function(){
    const parts=db.orders.flatMap(order=>(order.parts||[]).map(part=>({...part,order})));
    const awaitingOrders=db.orders.filter(order=>approvalPendingV10(order)&&['aprovacao','pecas'].includes(order.stage)).length;
    const rows=parts.map(item=>{
      const eq=getEquipment(item.order.equipmentId),commercial=item.purchase||{},next=purchaseNextStatusV8(item.status),blocked=next==='Comprada'&&!approvalGrantedV10(item.order);
      const actionLabel=blocked?'Aguardando aprovação':next?`Marcar como ${next}`:'';
      return `<tr><td>${item.photo?`<img class="part-photo" src="${safe(item.photo)}" alt="Foto da peça">`:'<span class="part-photo-placeholder">—</span>'}</td><td><div class="part-technical"><strong>${safe(item.name)}</strong><small>Código: ${safe(item.code||'não informado')}</small><small>Medidas: ${safe(item.dimensions||'não informadas')}</small><small>Aplicação: ${safe(item.position||'não informada')}</small></div></td><td><a class="table-link" href="#order/${item.order.id}">OS #${safe(item.order.number)}</a><br>${safe(eq?.tag||'—')} · ${safe(equipmentDescription(eq))}</td><td>${safe(partQuantity(item))}</td><td>${badge(item.status,partTone(item.status))}</td><td>${approvalColumnV10(item.order)}</td><td><div class="commercial-summary"><strong>${safe(commercial.supplier||'Compras ainda não preencheu')}</strong><span>${commercial.expectedDate?`Previsão: ${formatDate(commercial.expectedDate)}`:'Sem previsão'}</span><span>${commercial.quote?`Cotação/Pedido: ${safe(commercial.quote)}`:''}</span></div></td><td>${safe(commercial.location||'—')}</td><td><div class="row-actions"><button class="btn btn-light btn-sm" data-action="edit-purchase" data-order="${item.order.id}" data-part="${item.id}">${icon('edit',14)} Dados da compra</button>${next?`<button class="btn ${blocked?'btn-light':'btn-primary'} btn-sm" data-action="advance-part" data-order="${item.order.id}" data-part="${item.id}" ${blocked?'aria-describedby="approval-blocked-help-v10"':''}>${safe(actionLabel)}</button>`:`<span class="purchase-handoff-status">${item.status==='Separada'?'Aguardando instalação na Oficina':'Instalada pela Oficina'}</span>`}</div></td></tr>`;
    }).join('');
    const pending=parts.filter(part=>!['Recebida','Separada','Instalada'].includes(part.status)).length;
    return shell(`<div class="page">${pageHead('Peças e Compras','Compras pode cotar enquanto o cliente avalia. A compra só é liberada depois da aprovação.',`<button class="btn btn-primary" data-action="new-part-global">${icon('plus')} Nova solicitação técnica</button>`)}<div class="approval-rule-banner-v10" id="approval-blocked-help-v10">${icon('check',22)}<div><strong>Regra de segurança comercial</strong><span>Solicitar e cotar: permitido antes da aprovação. Comprar: exige aprovação. Instalar: somente a Oficina.</span></div></div><div class="grid kpi-grid">${kpi(parts.length,'Itens rastreados','gear','bg-blue')}${kpi(awaitingOrders,'Aguardando aprovação','clock','bg-amber','#orders/aprovacao','Ver aprovações')}${kpi(parts.filter(p=>p.status==='Em cotação').length,'Em cotação','clipboard','bg-purple')}${kpi(parts.filter(p=>p.status==='Comprada').length,'Comprados','box','bg-amber')}${kpi(pending,'Pendentes de recebimento','clock','bg-red')}</div><section class="card"><div class="card-head"><div><h2>Fila integrada de materiais</h2><p>O status da aprovação aparece ao lado de cada item para evitar compras sem autorização.</p></div></div><div class="table-wrap"><table class="table"><thead><tr><th>Foto</th><th>Especificação técnica</th><th>OS / Equipamento</th><th>Qtd.</th><th>Material</th><th>Aprovação</th><th>Dados de Compras</th><th>Local</th><th>Ações</th></tr></thead><tbody>${rows||'<tr><td colspan="9"><div class="empty">Nenhuma peça cadastrada</div></td></tr>'}</tbody></table></div></section></div>`,'parts');
  };

  dashboardView=function(){
    const counts=Object.fromEntries(STAGES.map(stage=>[stage.id,db.orders.filter(order=>order.stage===stage.id).length]));
    const openCount=db.orders.filter(order=>order.stage!=='concluida').length,pendingReports=db.orders.filter(order=>order.stage==='relatorio'||(order.stage==='concluida'&&!order.report?.sent)).length;
    const pendingParts=db.orders.flatMap(order=>order.parts||[]).filter(part=>!['Recebida','Separada','Instalada'].includes(part.status)).length;
    const pendingApprovals=db.orders.filter(order=>approvalPendingV10(order)&&['aprovacao','pecas'].includes(order.stage)).length;
    const overdue=db.orders.filter(order=>order.stage!=='concluida'&&order.dueDate&&order.dueDate<todayISO()).length;
    const queue=STAGES.map(stage=>{const orders=db.orders.filter(order=>order.stage===stage.id);const lineColor=stage.id==='aprovacao'?'#d28a00':stage.id==='pecas'?'#e69a13':stage.id==='concluida'?'#239257':stage.id==='montagem'?'#62556e':stage.id==='testes'?'#477a7c':'#c9202f';return `<section class="kanban-col"><a class="kanban-head kanban-head-link" href="#orders/${stage.id}" style="border-bottom-color:${lineColor}"><span>${safe(stage.label)}</span><span>${orders.length} ${icon('arrow',12)}</span></a><div class="kanban-list">${orders.slice(0,4).map(order=>{const eq=getEquipment(order.equipmentId),client=getClient(order.clientId);return `<article class="os-mini" tabindex="0" role="button" data-action="open-order" data-id="${order.id}"><strong>OS #${safe(order.number)}</strong><p>${safe(equipmentDescription(eq))}</p><p>${safe(client?.name||'Cliente não encontrado')}</p>${stage.id==='aprovacao'?`<div class="mini-status">${badge(approvalLabelV10(order),approvalToneV10(approvalLabelV10(order)))}</div>`:`<div class="mini-status">${badge(formatDate(order.dueDate),order.dueDate&&order.dueDate<todayISO()&&order.stage!=='concluida'?'red':'gray')}</div>`}</article>`;}).join('')||'<div class="empty compact"><span>Nenhuma OS</span></div>'}</div></section>`;}).join('');
    const clientsRank=db.clients.map(client=>({client,count:db.orders.filter(order=>order.clientId===client.id).length})).sort((a,b)=>b.count-a.count);
    return shell(`<div class="page dashboard-page">${pageHead('Olá, Administrador!','Acompanhe operação, aprovações, compras e passagem entre equipes.',`<button class="btn btn-primary" data-action="new-order">${icon('plus')} Nova ordem de serviço</button>`)}<div class="grid kpi-grid dashboard-kpis">${kpi(openCount,'OS abertas','clipboard','bg-blue','#orders/open','Escolher OS')}${kpi(counts.entrada,'Na recepção','users','bg-gray','#orders/entrada','Ver recebimentos')}${kpi(counts.diagnostico+counts.montagem,'Na oficina','tools','bg-purple','#workshop','Abrir oficina')}${kpi(pendingApprovals,'Aguardando cliente','clock','bg-amber','#orders/aprovacao','Ver aprovações')}${kpi(counts.pecas,'Com compras','box','bg-amber','#parts','Abrir compras')}${kpi(counts.testes,'Em qualidade','chart','bg-teal','#orders/testes','Ver testes')}${kpi(pendingReports,'Para relatórios','file','bg-blue','#reports','Abrir relatórios')}${kpi(counts.concluida,'Concluídas','check','bg-green','#orders/concluida','Ver concluídas')}</div><section class="card queue-card"><div class="card-head"><div><h2>Fila de trabalho por equipe</h2><p>A aprovação fica entre o diagnóstico e a montagem; Compras pode cotar em paralelo.</p></div><a href="#orders/open" class="table-link">Ver todas as OS abertas</a></div><div class="card-body"><div class="kanban" data-preserve-scroll="dashboard-kanban">${queue}</div></div></section><div class="grid dashboard-secondary"><section class="card"><div class="card-head"><h2>Produtividade mensal</h2>${badge('Últimos 6 meses','blue')}</div><div class="card-body"><div class="chart">${[32,45,38,50,62,counts.concluida*11].map((value,index)=>`<div class="bar-wrap"><strong>${value}</strong><div class="bar ${index===5?'current':''}" style="height:${Math.max(10,value)}%"></div><span>${['Mar','Abr','Mai','Jun','Jul','Ago'][index]}</span></div>`).join('')}</div></div></section><div class="stack"><section class="card"><div class="card-head"><h2>Alertas importantes</h2></div><div class="card-body alert-list"><a class="alert-item alert-link" href="#orders/aprovacao"><div class="alert-icon tone-amber">${icon('clock')}</div><div><strong>${pendingApprovals} aprovações pendentes</strong><p>Cliente ainda não liberou compra ou montagem.</p></div>${icon('arrow',16)}</a><a class="alert-item alert-link" href="#parts"><div class="alert-icon tone-red">${icon('alert')}</div><div><strong>${pendingParts} peças ainda pendentes</strong><p>Abrir fila integrada de materiais.</p></div>${icon('arrow',16)}</a><a class="alert-item alert-link" href="#orders/open"><div class="alert-icon tone-amber">${icon('clock')}</div><div><strong>${overdue} ordens atrasadas</strong><p>Localizar OS com prazo ultrapassado.</p></div>${icon('arrow',16)}</a></div></section><section class="card"><div class="card-head"><h2>Clientes atendidos</h2></div><div class="card-body ranking-list">${clientsRank.map((item,index)=>`<a class="ranking-item ranking-link" href="#client/${item.client.id}"><span>${index+1}º</span><div><strong>${safe(item.client.name)}</strong><small>${item.count} ordem(ns) de serviço</small></div>${icon('arrow',15)}</a>`).join('')}</div></section></div></div></div>`,'dashboard');
  };

  portalView=function(requestedClientId=''){
    const client=resolvePortalClientV8(requestedClientId);if(!client)return notFoundView();
    const orders=db.orders.filter(order=>order.clientId===client.id),equipment=db.equipment.filter(eq=>eq.clientId===client.id),currentOrders=equipment.map(eq=>latestOrderForEquipmentV7(eq.id,orders)).filter(Boolean);
    const pendingApprovals=orders.filter(order=>ensureApprovalV10(order).status===APPROVAL_STATUS_V10.WAITING);
    const awaitingParts=currentOrders.filter(order=>order.stage==='pecas').length,ready=currentOrders.filter(order=>order.stage==='concluida').length,reports=orders.filter(order=>order.report?.sent).length;
    const progressCards=equipment.map(eq=>equipmentProgressCardV7(eq,latestOrderForEquipmentV7(eq.id,orders),true)).join('');
    const approvalCards=pendingApprovals.map(order=>{const approval=ensureApprovalV10(order),eq=getEquipment(order.equipmentId);return `<article class="portal-approval-card-v10"><div class="portal-approval-card-head"><div><span>OS #${safe(order.number)} · ${safe(eq?.tag||'Equipamento')}</span><h3>${safe(equipmentDescription(eq))}</h3></div>${badge('Aguardando sua decisão','amber')}</div><div class="portal-approval-body-v10"><div><small>Escopo proposto</small><p>${safe(approval.scope||'Escopo não informado.')}</p></div><div class="portal-approval-commercial-v10"><div><small>Valor</small><strong>${safe(approvalMoneyV10(approval.amount))}</strong></div><div><small>Validade</small><strong>${formatDate(approval.validUntil)}</strong></div></div>${approval.terms?`<details><summary>Condições e prazo</summary><p>${safe(approval.terms)}</p></details>`:''}</div><div class="portal-approval-actions-v10"><button class="btn btn-light" data-action="portal-adjustment-v10" data-id="${order.id}">Solicitar ajuste</button><button class="btn btn-success" data-action="portal-approval-v10" data-id="${order.id}">${icon('check')} Aprovar serviço</button></div></article>`;}).join('');
    const recent=[...orders].sort((a,b)=>orderTimestampV7(b)-orderTimestampV7(a)).slice(0,6);
    return shell(`<div class="page portal-page">${pageHead('Dashboard da empresa',`${safe(client.name)} acompanha exclusivamente os próprios equipamentos, aprovações e relatórios.`,`<span class="live-pill"><i></i>Dados atualizados</span>`)}<section class="portal-isolation-notice">${icon('check',18)}<div><strong>Acesso exclusivo de ${safe(client.name)}</strong><span>As aprovações registradas aqui são vinculadas somente às ordens desta empresa.</span></div></section><div class="grid kpi-grid portal-kpis">${kpi(currentOrders.filter(order=>order.stage!=='concluida').length,'Em manutenção','tools','bg-blue')}${kpi(pendingApprovals.length,'Aguardando sua aprovação','clock','bg-amber')}${kpi(awaitingParts,'Aguardando peças','box','bg-purple')}${kpi(ready,'Prontos para retirada','check','bg-green')}${kpi(reports,'Relatórios disponíveis','file','bg-blue')}</div>${pendingApprovals.length?`<section class="card portal-approvals-section-v10"><div class="card-head"><div><h2>Aprovações pendentes</h2><p>Revise o escopo, valor e condições antes de liberar a compra ou a montagem.</p></div></div><div class="card-body portal-approval-grid-v10">${approvalCards}</div></section>`:''}<section class="card portal-live-card"><div class="card-head"><div><h2>Andamento dos seus equipamentos</h2><p>Após a aprovação, o equipamento avança automaticamente para Compras ou Montagem.</p></div></div><div class="card-body client-equipment-progress portal-progress-grid">${progressCards||'<div class="empty">Nenhum equipamento cadastrado.</div>'}</div></section><div class="grid portal-bottom-layout"><section class="card"><div class="card-head"><h2>Atualizações recentes</h2></div><div class="card-body timeline">${recent.map(order=>`<div class="timeline-item"><strong>${safe(getEquipment(order.equipmentId)?.tag||'Equipamento')} · ${safe(stageLabel(order.stage))}</strong><p>OS #${safe(order.number)} · ${formatDateTime(order.availableSince||order.createdAt||order.entryDate)}</p><p>${safe(order.records?.tests||order.records?.assembly||order.records?.diagnosis||order.defect||'Atualização operacional registrada.')}</p></div>`).join('')||'<div class="empty">Nenhuma atualização.</div>'}</div></section><aside class="stack"><section class="card"><div class="card-head"><h2>Situação comercial</h2></div><div class="card-body alert-list">${orders.filter(order=>ensureApprovalV10(order).status!==APPROVAL_STATUS_V10.DRAFT).slice(0,5).map(order=>`<div class="alert-item"><div class="alert-icon tone-${approvalToneV10(approvalLabelV10(order))}">${icon(approvalGrantedV10(order)?'check':'clock')}</div><div><strong>OS #${safe(order.number)}</strong><p>${safe(approvalLabelV10(order))}</p></div></div>`).join('')||'<div class="empty">Nenhuma proposta registrada.</div>'}</div></section><section class="card"><div class="card-head"><h2>Relatórios disponíveis</h2></div><div class="card-body alert-list">${orders.filter(order=>order.report?.sent).map(order=>`<div class="alert-item"><div class="alert-icon tone-blue">${icon('file')}</div><div class="grow"><strong>OS #${safe(order.number)}</strong><p>Enviado em ${formatDateTime(order.report.sentAt)}</p></div><button class="btn btn-light btn-sm" data-action="portal-report" data-id="${order.id}">${icon('download',14)} Abrir</button></div>`).join('')||'<div class="empty">Nenhum relatório disponível.</div>'}</div></section></aside></div></div>`,'portal',true,client.id);
  };

  function openPortalApprovalModalV10(orderId) {
    const client=resolvePortalClientV8(),order=getOrder(orderId);if(!portalOrderAllowedV8(order,client,false))return toast('Esta aprovação não pertence à empresa conectada.','error');const approval=ensureApprovalV10(order);
    openModal('Confirmar aprovação do serviço',`<div class="stack"><div class="approval-modal-summary-v10">${icon('check',24)}<div><strong>OS #${safe(order.number)} · ${safe(approvalMoneyV10(approval.amount))}</strong><p>${safe(approval.scope)}</p></div></div><label class="approval-consent-v10"><input type="checkbox" id="portal-approval-consent-v10"><span>Confirmo que revisei o escopo, valor e condições apresentados e autorizo a AR7 a prosseguir com a compra dos materiais e/ou montagem do equipamento.</span></label><div class="form-group"><label>Comentário opcional</label><textarea class="textarea" id="portal-approval-comment-v10" placeholder="Número do pedido, observação interna ou condição adicional..."></textarea></div></div>`,`<button class="btn btn-light" data-action="close-modal">Cancelar</button><button class="btn btn-success" data-action="confirm-portal-approval-v10" data-id="${order.id}">${icon('check')} Confirmar aprovação</button>`);
  }
  function confirmPortalApprovalV10(orderId) {
    const client=resolvePortalClientV8(),order=getOrder(orderId);if(!portalOrderAllowedV8(order,client,false))return toast('Acesso negado.','error');
    if(!document.getElementById('portal-approval-consent-v10')?.checked)return toast('Marque a confirmação para aprovar.','error');
    const approval=ensureApprovalV10(order);if(approval.status!==APPROVAL_STATUS_V10.WAITING)return toast('Esta proposta não está aguardando aprovação.','error');approval.status=APPROVAL_STATUS_V10.APPROVED;approval.decidedAt=new Date().toISOString();approval.decidedBy=getClient(order.clientId)?.contact||getClient(order.clientId)?.name||'Cliente';approval.decisionChannel='Portal do Cliente';approval.clientComment=(document.getElementById('portal-approval-comment-v10')?.value||'').trim();
    moveAfterApprovalV10(order,`${approval.decidedBy} pelo Portal do Cliente`);saveDB();closeModal();render();toast('Serviço aprovado. A AR7 foi notificada e o processo foi liberado.');
  }
  function openPortalAdjustmentModalV10(orderId) {
    const client=resolvePortalClientV8(),order=getOrder(orderId);if(!portalOrderAllowedV8(order,client,false))return toast('Acesso negado.','error');
    openModal('Solicitar ajuste da proposta',`<div class="stack"><p>Descreva claramente o que precisa ser revisto antes da aprovação.</p><div class="form-group"><label>Solicitação de ajuste *</label><textarea class="textarea stage-large-text" id="portal-adjustment-comment-v10" placeholder="Ex.: revisar prazo, remover determinada peça, esclarecer escopo... "></textarea></div></div>`,`<button class="btn btn-light" data-action="close-modal">Cancelar</button><button class="btn btn-primary" data-action="confirm-portal-adjustment-v10" data-id="${order.id}">Enviar solicitação</button>`);
  }
  function confirmPortalAdjustmentV10(orderId) {
    const client=resolvePortalClientV8(),order=getOrder(orderId);if(!portalOrderAllowedV8(order,client,false))return toast('Acesso negado.','error');const comment=(document.getElementById('portal-adjustment-comment-v10')?.value||'').trim();if(comment.length<5)return toast('Descreva o ajuste solicitado.','error');
    const approval=ensureApprovalV10(order);if(approval.status!==APPROVAL_STATUS_V10.WAITING)return toast('Esta proposta não está aguardando decisão.','error');approval.status=APPROVAL_STATUS_V10.ADJUSTMENT;approval.decidedAt=new Date().toISOString();approval.decidedBy=getClient(order.clientId)?.contact||getClient(order.clientId)?.name||'Cliente';approval.decisionChannel='Portal do Cliente';approval.clientComment=comment;addActivity(`OS ${order.number}: cliente solicitou ajuste na proposta.`);saveDB();closeModal();render();toast('Solicitação enviada para a AR7.');
  }

  const reportDocumentBeforeV10=reportDocumentV5;
  reportDocumentV5=function(order){
    const approval=ensureApprovalV10(order),decision=approvalGrantedV10(order)?`${approval.status} por ${approval.decidedBy||approval.waivedBy||'responsável autorizado'}`:approval.status;
    let html=reportDocumentBeforeV10(order);
    const block=`<div class="report-approval-block-v10"><h2>Aprovação do escopo</h2><div class="report-info-grid"><article><span>Status</span><strong>${safe(decision)}</strong><p>${approval.decidedAt?formatDateTime(approval.decidedAt):'Decisão ainda não registrada'}</p></article><article><span>Valor apresentado</span><strong>${safe(approvalMoneyV10(approval.amount))}</strong><p>Validade: ${formatDate(approval.validUntil)}</p></article></div><p><strong>Escopo aprovado:</strong> ${safe(approval.scope||'Não aplicável.')}</p>${approval.clientComment?`<p><strong>Observação:</strong> ${safe(approval.clientComment)}</p>`:''}${approval.waiverReason?`<p><strong>Justificativa da dispensa:</strong> ${safe(approval.waiverReason)}</p>`:''}</div>`;
    return html.replace('<h2 class="report-section-title supervisor-title-v9">Revisão e aprovação</h2>',`${block}<h2 class="report-section-title supervisor-title-v9">Revisão e aprovação</h2>`);
  };

  const shellBeforeV10=shell;
  shell=function(content,route,portal=false,portalClientId=''){return shellBeforeV10(content,route,portal,portalClientId).replace(/<small>v9<\/small>/g,'<small>v10</small>');};

  const handleV8SecurityActionsBeforeV10=handleV8SecurityActions;
  handleV8SecurityActions=function(event){
    const target=event.target.closest('[data-action]');if(!target)return false;const action=target.dataset.action;
    const stop=()=>{event.preventDefault();event.stopImmediatePropagation();};
    if(action==='save-approval-v10'){stop();saveApprovalDraftV10(target.dataset.id);return true;}
    if(action==='send-approval-v10'){stop();sendApprovalV10(target.dataset.id);return true;}
    if(action==='manual-approval-v10'){stop();openManualApprovalModalV10(target.dataset.id);return true;}
    if(action==='confirm-manual-approval-v10'){stop();confirmManualApprovalV10(target.dataset.id);return true;}
    if(action==='waive-approval-v10'){stop();openWaiveApprovalModalV10(target.dataset.id);return true;}
    if(action==='confirm-waive-approval-v10'){stop();confirmWaiveApprovalV10(target.dataset.id);return true;}
    if(action==='portal-approval-v10'){stop();openPortalApprovalModalV10(target.dataset.id);return true;}
    if(action==='confirm-portal-approval-v10'){stop();confirmPortalApprovalV10(target.dataset.id);return true;}
    if(action==='portal-adjustment-v10'){stop();openPortalAdjustmentModalV10(target.dataset.id);return true;}
    if(action==='confirm-portal-adjustment-v10'){stop();confirmPortalAdjustmentV10(target.dataset.id);return true;}
    return handleV8SecurityActionsBeforeV10(event);
  };


  /* =========================
     AR7 V11 — cotação, orçamento, revisão interna e aprovação do cliente
     ========================= */
  const QUOTATION_STATUS_V11={PENDING:'Pendente',IN_PROGRESS:'Em andamento',COMPLETE:'Concluída'};
  const BUDGET_STATUS_V11={DRAFT:'Rascunho',REVIEW:'Aguardando revisão interna',INTERNAL_APPROVED:'Aprovado internamente',SENT:'Enviado ao cliente',ADJUSTMENT:'Em ajuste'};
  const BILLING_TYPES_V11=['Normal','Garantia','Contrato com autorização prévia','Cortesia técnica'];
  const QUOTE_SOURCES_V11=['Fornecedor','Estoque próprio','Fornecida pelo cliente'];

  STAGES.splice(0,STAGES.length,
    {id:'entrada',label:'Recebimento',team:'Recepção',short:'Receber e conferir'},
    {id:'diagnostico',label:'Diagnóstico',team:'Oficina',short:'Desmontar e diagnosticar'},
    {id:'cotacao',label:'Cotação de fornecedores',team:'Compras',short:'Levantar custos e prazos'},
    {id:'orcamento',label:'Orçamento',team:'Comercial / Supervisor',short:'Montar e revisar proposta'},
    {id:'aprovacao',label:'Aguardando cliente',team:'Cliente',short:'Analisar e autorizar'},
    {id:'pecas',label:'Compra e materiais',team:'Compras / Almoxarifado',short:'Comprar, receber e separar'},
    {id:'montagem',label:'Montagem',team:'Oficina',short:'Executar a montagem'},
    {id:'testes',label:'Testes finais',team:'Qualidade',short:'Medir e validar'},
    {id:'relatorio',label:'Relatório e envio',team:'Administrativo',short:'Revisar e enviar'},
    {id:'concluida',label:'Concluída',team:'Cliente / Entrega',short:'Disponível para retirada'}
  );

  function parseNumberV11(value){
    if(typeof value==='number')return Number.isFinite(value)?value:0;
    let text=String(value??'').trim().replace(/R\$/gi,'').replace(/\s/g,'');
    if(!text)return 0;
    if(text.includes(',')&&text.includes('.'))text=text.replace(/\./g,'').replace(',','.');
    else if(text.includes(','))text=text.replace(',','.');
    text=text.replace(/[^0-9.-]/g,'');
    const number=Number(text);return Number.isFinite(number)?number:0;
  }
  function quantityNumberV11(part){return Math.max(0,parseNumberV11(part?.quantity||1)||1);}
  function moneyV11(value){return parseNumberV11(value).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
  function percentV11(value){return `${parseNumberV11(value).toLocaleString('pt-BR',{maximumFractionDigits:2})}%`;}

  function normalizeSupplierQuoteV11(quote={}){
    return {id:quote.id||id('qt'),source:QUOTE_SOURCES_V11.includes(quote.source)?quote.source:'Fornecedor',supplier:quote.supplier||'',brand:quote.brand||'',unitPrice:String(quote.unitPrice??quote.price??''),freight:String(quote.freight??''),expectedDate:quote.expectedDate||'',quoteNumber:quote.quoteNumber||quote.quote||'',paymentTerms:quote.paymentTerms||'',note:quote.note||'',stockLocation:quote.stockLocation||'',selected:Boolean(quote.selected),createdAt:quote.createdAt||new Date().toISOString()};
  }
  function ensureQuotationV11(order){
    const current=order.quotation||{};Object.assign(current,{status:QUOTATION_STATUS_V11.PENDING,responsible:'',laborCost:'',thirdPartyCost:'',otherCost:'',notes:'',completedAt:'',...current});order.quotation=current;
    (order.parts||[]).forEach(part=>{
      part.quotations=Array.isArray(part.quotations)?part.quotations.map(normalizeSupplierQuoteV11):[];
      if(!part.quotations.length&&part.purchase&&(part.purchase.supplier||part.purchase.price||part.purchase.quote)){
        part.quotations.push(normalizeSupplierQuoteV11({source:'Fornecedor',supplier:part.purchase.supplier,unitPrice:part.purchase.price,expectedDate:part.purchase.expectedDate,quoteNumber:part.purchase.quote,note:part.purchase.note,selected:true}));
      }
      if(part.quotations.length&&!part.quotations.some(item=>item.selected))part.quotations[0].selected=true;
    });
    return order.quotation;
  }
  function ensureBudgetV11(order){
    const approval=ensureApprovalV10(order),quotation=ensureQuotationV11(order),client=getClient(order.clientId),current=order.budget||{};
    Object.assign(current,{revision:1,status:BUDGET_STATUS_V11.DRAFT,billingType:'Normal',technicalScope:approval.scope||order.records?.diagnosis||'',partsMarkup:'30',laborPrice:quotation.laborCost||'',thirdPartyPrice:quotation.thirdPartyCost||'',freightPrice:'',otherPrice:quotation.otherCost||'',taxPercent:'0',discountPercent:'0',discount:'0',paymentTerms:'28 dias',warranty:'90 dias para os serviços executados, observadas as condições de operação e aplicação.',executionDays:'7',validUntil:approval.validUntil||'',recipient:approval.recipient||client?.email||'',commercialNotes:'',internalReviewer:'',internalReviewNote:'',internalApprovedAt:'',sentAt:'',proposalCode:`PROP-${order.number}-R01`,...current});order.budget=current;
    current.revision=Math.max(1,Number(current.revision)||1);
    current.proposalCode=`PROP-${order.number}-R${String(current.revision).padStart(2,'0')}`;
    return current;
  }
  function selectedQuoteV11(part){return (part?.quotations||[]).find(item=>item.selected)||null;}
  function quoteIsValidV11(quote){
    if(!quote)return false;
    if(quote.source==='Fornecedor')return Boolean(quote.supplier?.trim())&&parseNumberV11(quote.unitPrice)>0;
    if(quote.source==='Estoque próprio')return Boolean(quote.stockLocation?.trim())&&parseNumberV11(quote.unitPrice)>=0;
    return quote.source==='Fornecida pelo cliente';
  }
  function selectedQuoteCostV11(part){const quote=selectedQuoteV11(part);if(!quote||quote.source==='Fornecida pelo cliente')return 0;return parseNumberV11(quote.unitPrice)*quantityNumberV11(part)+parseNumberV11(quote.freight);}
  function quotationTotalsV11(order){
    const quotation=ensureQuotationV11(order),partsCost=(order.parts||[]).reduce((sum,part)=>sum+selectedQuoteCostV11(part),0);
    const laborCost=parseNumberV11(quotation.laborCost),thirdPartyCost=parseNumberV11(quotation.thirdPartyCost),otherCost=parseNumberV11(quotation.otherCost);
    return {partsCost,laborCost,thirdPartyCost,otherCost,totalCost:partsCost+laborCost+thirdPartyCost+otherCost};
  }
  function budgetTotalsV11(order){
    const budget=ensureBudgetV11(order),quotation=quotationTotalsV11(order),partsSale=quotation.partsCost*(1+parseNumberV11(budget.partsMarkup)/100),labor=parseNumberV11(budget.laborPrice),thirdParty=parseNumberV11(budget.thirdPartyPrice),freight=parseNumberV11(budget.freightPrice),other=parseNumberV11(budget.otherPrice);
    const base=partsSale+labor+thirdParty+freight+other,discountPercent=Math.min(100,Math.max(0,parseNumberV11(budget.discountPercent))),discount=base*discountPercent/100,taxableBase=Math.max(0,base-discount),tax=taxableBase*parseNumberV11(budget.taxPercent)/100,total=Math.max(0,taxableBase+tax);
    return {...quotation,partsSale,labor,thirdParty,freight,other,base,discountPercent,discount,taxableBase,tax,total};
  }
  function budgetStatusToneV11(status){return status===BUDGET_STATUS_V11.INTERNAL_APPROVED?'green':status===BUDGET_STATUS_V11.SENT?'blue':status===BUDGET_STATUS_V11.REVIEW?'amber':status===BUDGET_STATUS_V11.ADJUSTMENT?'red':'gray';}

  function normalizeCommercialFlowV11(parsed){
    if(!parsed?.orders)return parsed;
    parsed.version=11;
    parsed.orders.forEach(order=>{
      ensureQuotationV11(order);ensureBudgetV11(order);const approval=ensureApprovalV10(order);
      if(['pecas','montagem','testes','relatorio','concluida'].includes(order.stage)&&!approvalGrantedV10(order)){
        approval.status=APPROVAL_STATUS_V10.APPROVED;approval.decidedAt=approval.decidedAt||order.availableSince||new Date().toISOString();approval.decidedBy=approval.decidedBy||'Migração de processo anterior';approval.decisionChannel=approval.decisionChannel||'Registro legado';
      }
      if(order.stage==='aprovacao'&&approval.status===APPROVAL_STATUS_V10.WAITING){const budget=ensureBudgetV11(order);budget.status=BUDGET_STATUS_V11.SENT;budget.sentAt=budget.sentAt||approval.sentAt;budget.technicalScope=budget.technicalScope||approval.scope;budget.recipient=budget.recipient||approval.recipient;}
    });
    return parsed;
  }
  const normalizeAfterLoadBeforeV11=normalizeAfterLoadV5;
  normalizeAfterLoadV5=function(parsed){return normalizeCommercialFlowV11(normalizeAfterLoadBeforeV11(parsed));};
  db=normalizeCommercialFlowV11(db);

  const stageToneBeforeV11=stageTone;
  stageTone=function(stage){return ({cotacao:'teal',orcamento:'purple',aprovacao:'amber'})[stage]||stageToneBeforeV11(stage);};

  const navItemsBeforeV11=navItems;
  navItems=function(portal=false){
    const items=navItemsBeforeV11(portal);if(portal)return items;
    if(!items.some(item=>item[0]==='budgets')){const index=items.findIndex(item=>item[0]==='parts');items.splice(index+1,0,['budgets','Orçamentos','file']);}
    return items;
  };

  const nextStageForOrderBeforeV11=nextStageForOrder;
  nextStageForOrder=function(order){
    if(order.stage==='diagnostico')return order.noPartsRequired||(order.parts||[]).length===0?STAGES.find(item=>item.id==='orcamento'):STAGES.find(item=>item.id==='cotacao');
    if(order.stage==='cotacao')return STAGES.find(item=>item.id==='orcamento');
    if(order.stage==='orcamento')return STAGES.find(item=>item.id==='aprovacao');
    if(order.stage==='aprovacao')return order.noPartsRequired||(order.parts||[]).length===0?STAGES.find(item=>item.id==='montagem'):STAGES.find(item=>item.id==='pecas');
    return nextStageForOrderBeforeV11(order);
  };

  const handoffButtonLabelBeforeV11=handoffButtonLabelV5;
  handoffButtonLabelV5=function(order){
    if(order.stage==='diagnostico')return order.noPartsRequired||(order.parts||[]).length===0?'Concluir diagnóstico e enviar para Orçamento':'Concluir diagnóstico e liberar Peças do orçamento';
    if(order.stage==='cotacao')return 'Concluir cotações e liberar Orçamento';
    if(order.stage==='orcamento')return 'Enviar orçamento ao cliente';
    if(order.stage==='aprovacao')return 'Aprovação registrada: liberar próxima equipe';
    return handoffButtonLabelBeforeV11(order);
  };

  function collectQuotationV11(order){
    const quotation=ensureQuotationV11(order),read=(field,current='')=>document.getElementById(field)?.value??current;
    quotation.responsible=String(read('quotation-responsible-v11',quotation.responsible)).trim();quotation.laborCost=String(read('quotation-labor-cost-v11',quotation.laborCost)).trim();quotation.thirdPartyCost=String(read('quotation-third-party-cost-v11',quotation.thirdPartyCost)).trim();quotation.otherCost=String(read('quotation-other-cost-v11',quotation.otherCost)).trim();quotation.notes=String(read('quotation-notes-v11',quotation.notes)).trim();
    quotation.status=(order.parts||[]).length&&order.parts.every(part=>quoteIsValidV11(selectedQuoteV11(part)))?QUOTATION_STATUS_V11.COMPLETE:QUOTATION_STATUS_V11.IN_PROGRESS;
    if(quotation.status===QUOTATION_STATUS_V11.COMPLETE&&!quotation.completedAt)quotation.completedAt=new Date().toISOString();return quotation;
  }
  function collectBudgetV11(order){
    const budget=ensureBudgetV11(order),read=(field,current='')=>document.getElementById(field)?.value??current;
    budget.billingType=String(read('budget-billing-type-v11',budget.billingType));budget.technicalScope=String(read('budget-scope-v11',budget.technicalScope)).trim();budget.partsMarkup=String(read('budget-parts-markup-v11',budget.partsMarkup)).trim();budget.laborPrice=String(read('budget-labor-v11',budget.laborPrice)).trim();budget.thirdPartyPrice=String(read('budget-third-party-v11',budget.thirdPartyPrice)).trim();budget.freightPrice=String(read('budget-freight-v11',budget.freightPrice)).trim();budget.otherPrice=String(read('budget-other-v11',budget.otherPrice)).trim();budget.taxPercent=String(read('budget-tax-v11',budget.taxPercent)).trim();budget.discountPercent=String(read('budget-discount-v11',budget.discountPercent??'0')).trim();budget.paymentTerms=String(read('budget-payment-v11',budget.paymentTerms)).trim();budget.warranty=String(read('budget-warranty-v11',budget.warranty)).trim();budget.executionDays=String(read('budget-execution-v11',budget.executionDays)).trim();budget.validUntil=String(read('budget-valid-v11',budget.validUntil)).trim();budget.recipient=String(read('budget-recipient-v11',budget.recipient)).trim();budget.commercialNotes=String(read('budget-notes-v11',budget.commercialNotes)).trim();return budget;
  }

  const saveStageDataBeforeV11=saveStageData;
  saveStageData=function(order,notify=true){if(order?.stage==='cotacao')collectQuotationV11(order);if(order?.stage==='orcamento')collectBudgetV11(order);return saveStageDataBeforeV11(order,notify);};

  const stageRequirementsBeforeV11=stageRequirements;
  stageRequirements=function(order){
    if(order.stage==='cotacao'){
      const quotation=ensureQuotationV11(order),parts=order.parts||[];
      return [{label:'Responsável pela cotação informado',ok:Boolean(quotation.responsible?.trim())},{label:'Uma opção de fornecimento selecionada para cada peça',ok:parts.length>0&&parts.every(part=>quoteIsValidV11(selectedQuoteV11(part)))},{label:'Custos internos conferidos',ok:quotation.status===QUOTATION_STATUS_V11.COMPLETE||parts.every(part=>quoteIsValidV11(selectedQuoteV11(part)))}];
    }
    if(order.stage==='orcamento'){
      const budget=ensureBudgetV11(order),totals=budgetTotalsV11(order),chargeRequired=budget.billingType==='Normal';
      return [{label:'Escopo técnico e comercial preenchido',ok:Boolean(budget.technicalScope?.trim().length>=20)},{label:'Valores do orçamento calculados',ok:!chargeRequired||totals.total>0},{label:'Condições de pagamento, garantia e validade preenchidas',ok:Boolean(budget.paymentTerms?.trim()&&budget.warranty?.trim()&&budget.validUntil)},{label:'Orçamento aprovado internamente pelo supervisor',ok:budget.status===BUDGET_STATUS_V11.INTERNAL_APPROVED||budget.status===BUDGET_STATUS_V11.SENT}];
    }
    const list=stageRequirementsBeforeV11(order);
    if(order.stage==='aprovacao'){
      const budget=ensureBudgetV11(order);list.unshift({label:'Orçamento revisado e enviado ao cliente',ok:budget.status===BUDGET_STATUS_V11.SENT});
    }
    return list;
  };

  function quotationCardsV11(order){
    return (order.parts||[]).map(part=>{
      const quotes=part.quotations||[],selected=selectedQuoteV11(part);
      const quoteRows=quotes.map(quote=>`<article class="supplier-quote-v11 ${quote.selected?'selected':''}"><div class="supplier-quote-main-v11"><div><span>${safe(quote.source)}</span><strong>${safe(quote.source==='Fornecedor'?quote.supplier:quote.source)}</strong><small>${quote.brand?safe(quote.brand):'Marca não informada'}${quote.quoteNumber?` · ${safe(quote.quoteNumber)}`:''}</small></div><div class="quote-price-v11"><strong>${moneyV11(parseNumberV11(quote.unitPrice)*quantityNumberV11(part)+parseNumberV11(quote.freight))}</strong><small>${quote.source==='Fornecedor'?`${moneyV11(quote.unitPrice)} / ${safe(part.unit||'un')}`:quote.source}</small></div></div><div class="supplier-quote-meta-v11"><span>${quote.expectedDate?`Entrega: ${formatDate(quote.expectedDate)}`:'Prazo não informado'}</span><span>${safe(quote.paymentTerms||'Condição não informada')}</span></div><div class="row-actions"><button class="btn btn-light btn-sm" data-action="edit-supplier-quote-v11" data-order="${order.id}" data-part="${part.id}" data-quote="${quote.id}">${icon('edit',14)} Editar</button>${quote.selected?`<span class="selected-quote-label-v11">${icon('check',14)} Selecionada</span>`:`<button class="btn btn-primary btn-sm" data-action="select-supplier-quote-v11" data-order="${order.id}" data-part="${part.id}" data-quote="${quote.id}">Selecionar</button>`}<button class="icon-danger" data-action="remove-supplier-quote-v11" data-order="${order.id}" data-part="${part.id}" data-quote="${quote.id}" aria-label="Excluir cotação">${icon('trash',14)}</button></div></article>`).join('');
      return `<section class="quote-part-card-v11"><div class="quote-part-head-v11"><div><span>${safe(part.position||'Aplicação não informada')}</span><h3>${safe(part.name)}</h3><p>Código: ${safe(part.code||'—')} · Medidas: ${safe(part.dimensions||'—')} · ${safe(partQuantity(part))}</p></div>${selected?badge('Opção escolhida','green'):badge('Falta selecionar','red')}</div><div class="supplier-quotes-grid-v11">${quoteRows||'<div class="empty compact"><strong>Nenhuma cotação registrada</strong><span>Inclua fornecedor, estoque próprio ou peça fornecida pelo cliente.</span></div>'}</div><button class="btn btn-light btn-sm" data-action="add-supplier-quote-v11" data-order="${order.id}" data-part="${part.id}">${icon('plus',14)} Adicionar opção de fornecimento</button></section>`;
    }).join('');
  }
  function quotationWorkspaceV11(order){
    const quotation=ensureQuotationV11(order),totals=quotationTotalsV11(order),client=getClient(order.clientId),eq=getEquipment(order.equipmentId);
    return `<section class="card stage-workspace quotation-workspace-v11"><div class="card-head"><div><div class="section-eyebrow">COTAÇÃO INTERNA · NÃO VISÍVEL AO CLIENTE</div><h2>Levantamento de custos e prazos</h2><p>Compras compara fornecedores e seleciona a opção que será usada para montar o orçamento. Nenhum pedido é realizado nesta etapa.</p></div>${badge(quotation.status,quotation.status===QUOTATION_STATUS_V11.COMPLETE?'green':'amber')}</div><div class="card-body stack"><div class="commercial-flow-strip-v11"><span class="done">1 Diagnóstico</span><span class="active">2 Cotação</span><span>3 Orçamento</span><span>4 Cliente</span><span>5 Compra</span></div><div class="quotation-context-v11"><div><small>OS / Cliente</small><strong>OS #${safe(order.number)} · ${safe(client?.name)}</strong></div><div><small>Equipamento</small><strong>${safe(eq?.tag)} · ${safe(equipmentDescription(eq))}</strong></div><div class="wide"><small>Diagnóstico</small><p>${safe(order.records?.diagnosis||'Não registrado')}</p></div></div>${quotationCardsV11(order)}<section class="quotation-costs-v11"><div class="stage-photo-head"><div><div class="section-eyebrow">CUSTOS INTERNOS</div><h3>Custos adicionais para formação do preço</h3><p>Esses valores são internos e não aparecem no portal do cliente.</p></div></div><div class="form-grid"><div class="form-group"><label for="quotation-responsible-v11">Responsável por Compras *</label><input class="input" id="quotation-responsible-v11" value="${safe(quotation.responsible)}" placeholder="Nome do responsável"></div><div class="form-group"><label>Custo interno de mão de obra</label><input class="input" id="quotation-labor-cost-v11" inputmode="decimal" value="${safe(quotation.laborCost)}" placeholder="0,00"></div><div class="form-group"><label>Serviços de terceiros</label><input class="input" id="quotation-third-party-cost-v11" inputmode="decimal" value="${safe(quotation.thirdPartyCost)}" placeholder="0,00"></div><div class="form-group"><label>Outros custos</label><input class="input" id="quotation-other-cost-v11" inputmode="decimal" value="${safe(quotation.otherCost)}" placeholder="0,00"></div><div class="form-group span-2"><label>Observações de Compras</label><textarea class="textarea" id="quotation-notes-v11">${safe(quotation.notes)}</textarea></div></div><div class="quotation-total-v11"><span>Custo estimado das peças</span><strong id="quotation-parts-preview-v12">${moneyV11(totals.partsCost)}</strong><span>Custo interno total</span><strong id="quotation-total-preview-v12">${moneyV11(totals.totalCost)}</strong></div></section></div></section>`;
  }

  function budgetSummaryTableV11(order,clientFacing=false){
    const budget=ensureBudgetV11(order),totals=budgetTotalsV11(order),rows=[['Peças e materiais',totals.partsSale],['Mão de obra técnica',totals.labor],['Serviços de terceiros',totals.thirdParty],['Frete e logística',totals.freight],['Outros serviços',totals.other]].filter(([,value])=>value>0);
    return `<div class="budget-summary-table-v11"><div class="budget-summary-head-v11"><span>Descrição</span><span>Valor</span></div>${rows.map(([label,value])=>`<div><span>${safe(label)}</span><strong>${moneyV11(value)}</strong></div>`).join('')||'<div><span>Serviço sem cobrança</span><strong>R$ 0,00</strong></div>'}${totals.tax>0?`<div><span>Tributos (${percentV11(budget.taxPercent)})</span><strong>${moneyV11(totals.tax)}</strong></div>`:''}${totals.discount>0?`<div class="discount"><span>Desconto (${percentV11(totals.discountPercent)})</span><strong>− ${moneyV11(totals.discount)}</strong></div>`:''}<div class="budget-total-row-v11"><span>VALOR TOTAL</span><strong>${moneyV11(totals.total)}</strong></div></div>`;
  }
  function budgetWorkspaceV11(order){
    const budget=ensureBudgetV11(order),totals=budgetTotalsV11(order),quotation=quotationTotalsV11(order),client=getClient(order.clientId),eq=getEquipment(order.equipmentId);
    const canApprove=budget.status===BUDGET_STATUS_V11.REVIEW;const canSend=budget.status===BUDGET_STATUS_V11.INTERNAL_APPROVED;
    return `<section class="card stage-workspace budget-workspace-v11"><div class="card-head"><div><div class="section-eyebrow">PROPOSTA ${safe(budget.proposalCode)}</div><h2>Montagem do orçamento para o cliente</h2><p>O orçamento utiliza os custos escolhidos por Compras, aplica preços comerciais e passa por revisão interna antes do envio.</p></div>${badge(budget.status,budgetStatusToneV11(budget.status))}</div><div class="card-body stack"><div class="commercial-flow-strip-v11"><span class="done">1 Diagnóstico</span><span class="done">2 Cotação</span><span class="active">3 Orçamento</span><span>4 Cliente</span><span>5 Compra</span></div><div class="budget-internal-cost-v11"><div><small>Custo interno estimado</small><strong id="budget-cost-preview-v12">${moneyV11(quotation.totalCost)}</strong><span>Não aparece ao cliente</span></div><div><small>Valor de venda calculado</small><strong id="budget-total-preview-v11">${moneyV11(totals.total)}</strong><span id="budget-margin-preview-v12">Margem bruta estimada: ${moneyV11(totals.total-quotation.totalCost)}</span></div></div><div class="budget-editor-layout-v11"><div class="stack"><section class="budget-form-section-v11"><h3>Escopo e enquadramento</h3><div class="form-grid"><div class="form-group"><label for="budget-billing-type-v11">Tipo de atendimento</label><select class="select" id="budget-billing-type-v11">${BILLING_TYPES_V11.map(type=>`<option ${budget.billingType===type?'selected':''}>${safe(type)}</option>`).join('')}</select></div><div class="form-group"><label for="budget-valid-v11">Validade da proposta *</label><input class="input" type="date" id="budget-valid-v11" value="${safe(budget.validUntil)}"></div><div class="form-group span-2"><label>Escopo técnico e comercial *</label><textarea class="textarea stage-large-text" id="budget-scope-v11">${safe(budget.technicalScope)}</textarea></div></div></section><section class="budget-form-section-v11"><h3>Formação do valor</h3><div class="form-grid"><div class="form-group"><label for="budget-parts-markup-v11">Margem nas peças (%)</label><input class="input budget-calc-v11" id="budget-parts-markup-v11" inputmode="decimal" value="${safe(budget.partsMarkup)}"></div><div class="form-group"><label for="budget-labor-v11">Mão de obra para o cliente</label><input class="input budget-calc-v11" id="budget-labor-v11" inputmode="decimal" value="${safe(budget.laborPrice)}"></div><div class="form-group"><label for="budget-third-party-v11">Serviços de terceiros</label><input class="input budget-calc-v11" id="budget-third-party-v11" inputmode="decimal" value="${safe(budget.thirdPartyPrice)}"></div><div class="form-group"><label for="budget-freight-v11">Frete / logística</label><input class="input budget-calc-v11" id="budget-freight-v11" inputmode="decimal" value="${safe(budget.freightPrice)}"></div><div class="form-group"><label for="budget-other-v11">Outros valores</label><input class="input budget-calc-v11" id="budget-other-v11" inputmode="decimal" value="${safe(budget.otherPrice)}"></div><div class="form-group"><label for="budget-tax-v11">Tributos (%)</label><input class="input budget-calc-v11" id="budget-tax-v11" inputmode="decimal" value="${safe(budget.taxPercent)}"></div><div class="form-group"><label for="budget-discount-v11">Desconto (%)</label><input class="input budget-calc-v11" id="budget-discount-v11" inputmode="decimal" type="number" min="0" max="100" step="0.01" value="${safe(budget.discountPercent??'0')}"><small>Percentual aplicado sobre o subtotal antes dos tributos.</small></div></div></section><section class="budget-form-section-v11"><h3>Condições da proposta</h3><div class="form-grid"><div class="form-group"><label for="budget-payment-v11">Condição de pagamento *</label><input class="input" id="budget-payment-v11" value="${safe(budget.paymentTerms)}"></div><div class="form-group"><label for="budget-execution-v11">Prazo após aprovação (dias úteis)</label><input class="input" id="budget-execution-v11" type="number" min="0" value="${safe(budget.executionDays)}"></div><div class="form-group span-2"><label>Garantia *</label><textarea class="textarea" id="budget-warranty-v11">${safe(budget.warranty)}</textarea></div><div class="form-group span-2"><label for="budget-recipient-v11">E-mail do cliente *</label><input class="input" type="email" id="budget-recipient-v11" value="${safe(budget.recipient||client?.email||'')}"></div><div class="form-group span-2"><label>Observações comerciais</label><textarea class="textarea" id="budget-notes-v11">${safe(budget.commercialNotes)}</textarea></div></div></section></div><aside class="budget-preview-card-v11"><div class="budget-preview-head-v11"><img src="./assets/ar7-logo.png" alt="AR7"><div><span>${safe(budget.proposalCode)}</span><strong>Orçamento de manutenção</strong></div></div><div class="budget-preview-client-v11"><small>Cliente</small><strong>${safe(client?.name)}</strong><span>${safe(eq?.tag)} · ${safe(equipmentDescription(eq))}</span></div><div id="budget-summary-preview-v12">${budgetSummaryTableV11(order,true)}</div><div class="budget-preview-terms-v11" id="budget-terms-preview-v12"><p><strong>Pagamento:</strong> ${safe(budget.paymentTerms)}</p><p><strong>Prazo:</strong> ${safe(budget.executionDays)} dias úteis após aprovação e disponibilidade dos materiais.</p><p><strong>Validade:</strong> ${formatDate(budget.validUntil)}</p></div></aside></div><div class="budget-workflow-actions-v11"><button class="btn btn-light" data-action="save-budget-v11" data-id="${order.id}">${icon('save')} Salvar rascunho</button><button class="btn btn-light" data-action="view-proposal-v11" data-id="${order.id}">${icon('file')} Visualizar proposta</button><button class="btn btn-primary" data-action="submit-budget-review-v11" data-id="${order.id}">Enviar para revisão interna</button><button class="btn btn-success" data-action="approve-budget-internal-v11" data-id="${order.id}" ${canApprove?'':'disabled'}>${icon('check')} Aprovar internamente</button><button class="btn btn-primary" data-action="send-budget-client-v11" data-id="${order.id}" ${canSend?'':'disabled'}>${icon('send')} Enviar ao cliente</button></div>${budget.internalReviewer?`<div class="internal-review-note-v11">${icon('check',18)}<div><strong>Revisado por ${safe(budget.internalReviewer)}</strong><span>${budget.internalApprovedAt?formatDateTime(budget.internalApprovedAt):''}${budget.internalReviewNote?` · ${safe(budget.internalReviewNote)}`:''}</span></div></div>`:''}</div></section>`;
  }

  function approvalWorkspaceV11(order){
    const approval=ensureApprovalV10(order),budget=ensureBudgetV11(order),client=getClient(order.clientId),eq=getEquipment(order.equipmentId),totals=budgetTotalsV11(order);
    return `<section class="card stage-workspace approval-workspace-v10 approval-workspace-v11"><div class="card-head"><div><div class="section-eyebrow">PROPOSTA ${safe(budget.proposalCode)} · REVISÃO ${budget.revision}</div><h2>Aguardando decisão do cliente</h2><p>O orçamento já foi cotado, montado e aprovado internamente. Compra e montagem permanecem bloqueadas até a autorização.</p></div>${badge(approval.status,approvalToneV10(approval.status))}</div><div class="card-body stack"><div class="commercial-flow-strip-v11"><span class="done">1 Diagnóstico</span><span class="done">2 Cotação</span><span class="done">3 Orçamento</span><span class="active">4 Cliente</span><span>5 Compra</span></div>${approvalSummaryV10(order)}${approval.status===APPROVAL_STATUS_V10.ADJUSTMENT||approval.status===APPROVAL_STATUS_V10.REJECTED?`<div class="approval-client-message-v10">${icon('alert',20)}<div><strong>Retorno do cliente</strong><p>${safe(approval.clientComment||'O cliente solicitou revisão do orçamento.')}</p></div><button class="btn btn-primary" data-action="reopen-budget-v11" data-id="${order.id}">Reabrir orçamento para ajuste</button></div>`:''}<div class="approval-official-proposal-v11"><div><small>Cliente / equipamento</small><strong>${safe(client?.name)} · ${safe(eq?.tag)}</strong><span>${safe(equipmentDescription(eq))}</span></div><div><small>Escopo aprovado internamente</small><p>${safe(budget.technicalScope)}</p></div>${budgetSummaryTableV11(order,true)}<div class="proposal-conditions-v11"><p><strong>Pagamento:</strong> ${safe(budget.paymentTerms)}</p><p><strong>Prazo:</strong> ${safe(budget.executionDays)} dias úteis</p><p><strong>Garantia:</strong> ${safe(budget.warranty)}</p><p><strong>Validade:</strong> ${formatDate(budget.validUntil)}</p></div></div><div class="approval-actions-v10"><button class="btn btn-light" data-action="view-proposal-v11" data-id="${order.id}">${icon('file')} Ver proposta enviada</button><button class="btn btn-success" data-action="manual-approval-v10" data-id="${order.id}">${icon('check')} Registrar aprovação recebida</button><button class="btn btn-light" data-action="waive-approval-v10" data-id="${order.id}">Registrar autorização contratual</button></div><div class="approval-context-v10"><strong>OS #${safe(order.number)} · ${safe(client?.name)}</strong><span>${safe(approval.recipient)} · Enviado em ${approval.sentAt?formatDateTime(approval.sentAt):'não enviado'}</span></div></div></section>`;
  }

  const currentStageWorkspaceBeforeV11=currentStageWorkspace;
  currentStageWorkspace=function(order){if(order.stage==='cotacao')return quotationWorkspaceV11(order);if(order.stage==='orcamento')return budgetWorkspaceV11(order);if(order.stage==='aprovacao')return approvalWorkspaceV11(order);return currentStageWorkspaceBeforeV11(order);};

  function openSupplierQuoteModalV11(orderId,partId,quoteId=''){
    const order=getOrder(orderId),part=order?.parts.find(item=>item.id===partId);if(!part)return toast('Peça não encontrada.','error');ensureQuotationV11(order);const quote=quoteId?(part.quotations||[]).find(item=>item.id===quoteId):normalizeSupplierQuoteV11({});
    openModal(quoteId?'Editar opção de fornecimento':'Nova opção de fornecimento',`<form id="supplier-quote-form-v11" class="form-grid"><input type="hidden" name="orderId" value="${safe(orderId)}"><input type="hidden" name="partId" value="${safe(partId)}"><input type="hidden" name="quoteId" value="${safe(quoteId)}"><div class="technical-callout span-2"><span>${icon('gear',20)}</span><div><strong>${safe(part.name)}</strong>${safe(part.code||'Sem código')} · ${safe(part.dimensions||'Sem medidas')} · ${safe(partQuantity(part))}</div></div><div class="form-group"><label>Origem da peça *</label><select class="select" name="source">${QUOTE_SOURCES_V11.map(source=>`<option ${quote.source===source?'selected':''}>${safe(source)}</option>`).join('')}</select></div><div class="form-group"><label>Fornecedor</label><input class="input" name="supplier" value="${safe(quote.supplier)}" placeholder="Obrigatório para compra externa"></div><div class="form-group"><label>Marca / fabricante</label><input class="input" name="brand" value="${safe(quote.brand)}"></div><div class="form-group"><label>Valor unitário</label><input class="input" name="unitPrice" inputmode="decimal" value="${safe(quote.unitPrice)}" placeholder="0,00"></div><div class="form-group"><label>Frete desta opção</label><input class="input" name="freight" inputmode="decimal" value="${safe(quote.freight)}" placeholder="0,00"></div><div class="form-group"><label>Previsão de entrega</label><input class="input" type="date" name="expectedDate" value="${safe(quote.expectedDate)}"></div><div class="form-group"><label>Nº da cotação</label><input class="input" name="quoteNumber" value="${safe(quote.quoteNumber)}"></div><div class="form-group"><label>Condição de pagamento</label><input class="input" name="paymentTerms" value="${safe(quote.paymentTerms)}" placeholder="Ex.: 28 dias"></div><div class="form-group span-2"><label>Local no estoque</label><input class="input" name="stockLocation" value="${safe(quote.stockLocation)}" placeholder="Obrigatório somente para estoque próprio"></div><div class="form-group span-2"><label>Observação</label><textarea class="textarea" name="note">${safe(quote.note)}</textarea></div></form>`,`<button class="btn btn-light" data-action="close-modal">Cancelar</button><button class="btn btn-primary" data-action="save-supplier-quote-v11">${icon('save')} Salvar opção</button>`);
  }
  function saveSupplierQuoteV11(){
    const form=document.getElementById('supplier-quote-form-v11');if(!form?.reportValidity())return;const data=Object.fromEntries(new FormData(form)),order=getOrder(data.orderId),part=order?.parts.find(item=>item.id===data.partId);if(!part)return;
    const quote=normalizeSupplierQuoteV11(data);quote.id=data.quoteId||id('qt');if(!quoteIsValidV11(quote))return toast(quote.source==='Fornecedor'?'Informe fornecedor e valor unitário.':quote.source==='Estoque próprio'?'Informe a localização no estoque.':'Revise os dados da opção.','error');
    part.quotations=part.quotations||[];const index=part.quotations.findIndex(item=>item.id===quote.id);if(index>=0){quote.selected=part.quotations[index].selected;part.quotations[index]=quote;}else{quote.selected=part.quotations.length===0;part.quotations.push(quote);}if(part.status==='Solicitada')part.status='Em cotação';if(quote.selected)applySelectedQuoteToPurchaseV11(part,quote);collectQuotationV11(order);addActivity(`OS ${order.number}: opção de fornecimento registrada para ${part.name}.`);saveDB();closeModal();render();toast('Cotação salva.');
  }
  function applySelectedQuoteToPurchaseV11(part,quote){part.purchase={...(part.purchase||{}),source:quote.source,supplier:quote.supplier||quote.source,brand:quote.brand,expectedDate:quote.expectedDate,quote:quote.quoteNumber,price:quote.unitPrice,note:quote.note,paymentTerms:quote.paymentTerms,location:quote.source==='Estoque próprio'?quote.stockLocation:(part.purchase?.location||'')};}
  function selectSupplierQuoteV11(orderId,partId,quoteId){const order=getOrder(orderId),part=order?.parts.find(item=>item.id===partId);if(!part)return;(part.quotations||[]).forEach(quote=>quote.selected=quote.id===quoteId);const selected=selectedQuoteV11(part);if(selected)applySelectedQuoteToPurchaseV11(part,selected);collectQuotationV11(order);saveDB();render();toast('Opção selecionada para formar o orçamento.');}
  function removeSupplierQuoteV11(orderId,partId,quoteId){const order=getOrder(orderId),part=order?.parts.find(item=>item.id===partId);if(!part)return;const removed=(part.quotations||[]).find(item=>item.id===quoteId);part.quotations=(part.quotations||[]).filter(item=>item.id!==quoteId);if(removed?.selected&&part.quotations.length){part.quotations[0].selected=true;applySelectedQuoteToPurchaseV11(part,part.quotations[0]);}collectQuotationV11(order);saveDB();render();toast('Opção removida.');}

  function saveBudgetV11(orderId,notify=true){const order=getOrder(orderId);if(!order)return;const budget=collectBudgetV11(order);if(budget.status===BUDGET_STATUS_V11.ADJUSTMENT)budget.status=BUDGET_STATUS_V11.DRAFT;saveDB();render();if(notify)toast('Rascunho do orçamento salvo.');}
  function submitBudgetReviewV11(orderId){const order=getOrder(orderId);if(!order)return;collectBudgetV11(order);const budget=ensureBudgetV11(order),totals=budgetTotalsV11(order);if(budget.technicalScope.trim().length<20)return toast('Descreva o escopo técnico e comercial.','error');if(budget.billingType==='Normal'&&totals.total<=0)return toast('Informe os valores do orçamento.','error');if(!budget.validUntil||!budget.paymentTerms.trim()||!budget.warranty.trim())return toast('Preencha validade, pagamento e garantia.','error');budget.status=BUDGET_STATUS_V11.REVIEW;addActivity(`OS ${order.number}: orçamento ${budget.proposalCode} enviado para revisão interna.`);saveDB();render();toast('Orçamento enviado para revisão interna.');}
  function openInternalBudgetApprovalV11(orderId){const order=getOrder(orderId);if(!order)return;const budget=collectBudgetV11(order);if(budget.status!==BUDGET_STATUS_V11.REVIEW)return toast('Envie o orçamento para revisão antes da aprovação interna.','error');openModal('Aprovação interna do orçamento',`<div class="stack"><div class="approval-modal-summary-v10">${icon('check',24)}<div><strong>${safe(budget.proposalCode)} · ${moneyV11(budgetTotalsV11(order).total)}</strong><p>Confirme valores, prazo, condições, margem e escopo antes do envio ao cliente.</p></div></div><div class="form-grid"><div class="form-group"><label>Supervisor / responsável *</label><input class="input" id="budget-reviewer-v11" value="${safe(order.supervisor&&order.supervisor!=='A definir'?order.supervisor:'')}"></div><div class="form-group span-2"><label>Observação da revisão</label><textarea class="textarea" id="budget-review-note-v11"></textarea></div></div></div>`,`<button class="btn btn-light" data-action="close-modal">Cancelar</button><button class="btn btn-success" data-action="confirm-budget-internal-v11" data-id="${order.id}">${icon('check')} Aprovar orçamento</button>`);}
  function confirmInternalBudgetV11(orderId){const order=getOrder(orderId);if(!order)return;const name=(document.getElementById('budget-reviewer-v11')?.value||'').trim();if(!name)return toast('Informe o responsável pela revisão.','error');const budget=ensureBudgetV11(order);budget.internalReviewer=name;budget.internalReviewNote=(document.getElementById('budget-review-note-v11')?.value||'').trim();budget.internalApprovedAt=new Date().toISOString();budget.status=BUDGET_STATUS_V11.INTERNAL_APPROVED;order.supervisor=name;addActivity(`OS ${order.number}: orçamento ${budget.proposalCode} aprovado internamente por ${name}.`);saveDB();closeModal();render();toast('Orçamento aprovado internamente e pronto para envio.');}
  function sendBudgetToClientV11(orderId){
    const order=getOrder(orderId);if(!order)return;collectBudgetV11(order);const budget=ensureBudgetV11(order),totals=budgetTotalsV11(order);if(budget.status!==BUDGET_STATUS_V11.INTERNAL_APPROVED)return toast('O supervisor precisa aprovar o orçamento antes do envio.','error');if(!budget.recipient.includes('@'))return toast('Informe um e-mail válido do cliente.','error');
    const approval=ensureApprovalV10(order);approval.scope=budget.technicalScope;approval.amount=totals.total.toFixed(2);approval.terms=`Pagamento: ${budget.paymentTerms}. Prazo: ${budget.executionDays} dias úteis após aprovação e disponibilidade dos materiais. Garantia: ${budget.warranty}`;approval.recipient=budget.recipient;approval.validUntil=budget.validUntil;approval.sentAt=new Date().toISOString();approval.decidedAt='';approval.decidedBy='';approval.clientComment='';budget.sentAt=approval.sentAt;budget.status=BUDGET_STATUS_V11.SENT;
    if(budget.billingType==='Normal'){approval.required=true;approval.status=APPROVAL_STATUS_V10.WAITING;const from=STAGES.find(item=>item.id==='orcamento'),to=STAGES.find(item=>item.id==='aprovacao');order.handoffs=order.handoffs||[];order.handoffs.push({fromStage:from.id,toStage:to.id,fromTeam:from.team,toTeam:to.team,at:new Date().toISOString(),note:`Orçamento ${budget.proposalCode} enviado ao cliente.`});order.stage='aprovacao';order.availableSince=new Date().toISOString();addActivity(`OS ${order.number}: orçamento ${budget.proposalCode} enviado para aprovação de ${budget.recipient}.`);}
    else {approval.required=false;approval.status=APPROVAL_STATUS_V10.WAIVED;approval.waivedBy=budget.internalReviewer;approval.waiverReason=`${budget.billingType}: autorização tratada conforme regra comercial registrada.`;approval.decidedAt=new Date().toISOString();approval.decidedBy=budget.internalReviewer;approval.decisionChannel=budget.billingType;order.stage=(order.noPartsRequired||(order.parts||[]).length===0)?'montagem':'pecas';order.availableSince=new Date().toISOString();addActivity(`OS ${order.number}: ${budget.billingType} liberou o processo sem aprovação comercial individual.`);}
    saveDB();render({resetScroll:true});toast(budget.billingType==='Normal'?'Orçamento enviado. Aguardando decisão do cliente.':'Regra comercial registrada e próxima equipe liberada.');
  }
  function reopenBudgetV11(orderId){const order=getOrder(orderId);if(!order)return;const budget=ensureBudgetV11(order),approval=ensureApprovalV10(order);budget.revision+=1;budget.status=BUDGET_STATUS_V11.ADJUSTMENT;budget.internalApprovedAt='';budget.internalReviewer='';budget.internalReviewNote='';budget.sentAt='';budget.proposalCode=`PROP-${order.number}-R${String(budget.revision).padStart(2,'0')}`;approval.status=APPROVAL_STATUS_V10.DRAFT;approval.sentAt='';order.stage='orcamento';order.availableSince=new Date().toISOString();order.handoffs=order.handoffs||[];order.handoffs.push({fromStage:'aprovacao',toStage:'orcamento',fromTeam:'Cliente / Comercial',toTeam:'Comercial / Supervisor',at:new Date().toISOString(),note:approval.clientComment||'Orçamento reaberto para ajuste.'});addActivity(`OS ${order.number}: orçamento reaberto como revisão ${budget.revision}.`);saveDB();render({resetScroll:true});toast('Orçamento reaberto para ajustes.');}

  const advanceStageBeforeV11=advanceStage;
  advanceStage=function(orderId){const order=getOrder(orderId);if(order?.stage==='orcamento')return sendBudgetToClientV11(orderId);if(order?.stage==='cotacao'){collectQuotationV11(order);saveDB();}return advanceStageBeforeV11(orderId);};

  function proposalDocumentV11(order){
    const budget=ensureBudgetV11(order),totals=budgetTotalsV11(order),client=getClient(order.clientId),eq=getEquipment(order.equipmentId),parts=(order.parts||[]).map(part=>{const quote=selectedQuoteV11(part);return `<tr><td>${safe(part.name)}</td><td>${safe(part.position||'—')}</td><td>${safe(part.code||'—')}</td><td>${safe(partQuantity(part))}</td><td>${safe(quote?.brand||quote?.supplier||quote?.source||'Conforme especificação')}</td></tr>`;}).join('');
    return `<div class="report-document proposal-document-v11" id="printable-report"><section class="report-page proposal-cover-v11"><div class="cover-brand"><img src="./assets/ar7-logo.png" alt="AR7 Elétrica"></div><div class="proposal-cover-tag-v11">PROPOSTA TÉCNICO-COMERCIAL</div><div class="cover-title"><span>${safe(budget.proposalCode)}</span><h1>OS ${safe(order.number)}</h1><p>${safe(equipmentDescription(eq))}</p></div><div class="proposal-cover-client-v11"><span>Preparada para</span><strong>${safe(client?.name)}</strong><p>${safe(eq?.tag)} · ${safe(eq?.serial||'Série não informada')}</p></div><div class="cover-data"><div><span>Emissão</span><strong>${new Intl.DateTimeFormat('pt-BR').format(new Date())}</strong></div><div><span>Validade</span><strong>${formatDate(budget.validUntil)}</strong></div><div><span>Revisão</span><strong>${budget.revision}</strong></div><div><span>Tipo</span><strong>${safe(budget.billingType)}</strong></div></div><div class="report-footer"><span>AR7 Elétrica</span><span>Documento comercial controlado</span></div></section><section class="report-page"><div class="report-page-header"><img src="./assets/ar7-logo.png" alt="AR7"><div><span>${safe(budget.proposalCode)}</span><strong>Escopo, valores e condições</strong></div></div><div class="report-info-grid"><article><span>Cliente</span><strong>${safe(client?.name)}</strong><p>${safe(client?.contact||'')} · ${safe(client?.email||'')}</p></article><article><span>Equipamento</span><strong>${safe(equipmentDescription(eq))}</strong><p>${safe(eq?.tag)} · ${safe(eq?.serial||'Sem série')}</p></article></div><div class="report-text-section"><h2>Diagnóstico apresentado</h2><p>${safe(order.records?.diagnosis||order.notes||'Conforme avaliação técnica realizada.')}</p></div><div class="report-text-section"><h2>Escopo proposto</h2><p>${safe(budget.technicalScope)}</p></div><h2 class="report-section-title">Materiais previstos</h2><table class="report-table"><thead><tr><th>Item</th><th>Aplicação</th><th>Código</th><th>Quantidade</th><th>Referência</th></tr></thead><tbody>${parts||'<tr><td colspan="5">Serviço sem fornecimento de peças.</td></tr>'}</tbody></table>${budgetSummaryTableV11(order,true)}<div class="proposal-terms-report-v11"><p><strong>Condição de pagamento:</strong> ${safe(budget.paymentTerms)}</p><p><strong>Prazo de execução:</strong> ${safe(budget.executionDays)} dias úteis após a aprovação e disponibilidade dos materiais.</p><p><strong>Garantia:</strong> ${safe(budget.warranty)}</p>${budget.commercialNotes?`<p><strong>Observações:</strong> ${safe(budget.commercialNotes)}</p>`:''}</div><div class="proposal-acceptance-v11"><div><span>APROVAÇÃO DO CLIENTE</span><p>Ao aprovar esta proposta, o cliente autoriza a AR7 Elétrica a executar o escopo descrito e adquirir os materiais necessários.</p></div><div class="proposal-sign-line-v11">Nome, data e autorização</div></div><div class="report-footer"><span>AR7 Elétrica</span><span>${safe(budget.proposalCode)}</span></div></section></div>`;
  }
  function proposalViewV11(orderId){const order=getOrder(orderId);if(!order)return notFoundView();return shell(`<div class="page">${pageHead(`Proposta ${safe(ensureBudgetV11(order).proposalCode)}`,'Visualização do documento que será apresentado ao cliente.',`<button class="btn btn-light" data-action="open-order" data-id="${order.id}">Voltar para a OS</button><button class="btn btn-primary" data-action="print-proposal-v11">${icon('download')} Gerar / salvar PDF</button>`)}<section class="pdf-shell pdf-shell-v5"><div class="pdf-toolbar"><span>${icon('file',17)}</span><span>${safe(ensureBudgetV11(order).proposalCode)}.pdf</span><span style="margin-left:auto">3 páginas</span></div>${proposalDocumentV11(order)}</section></div>`,'budgets');}
  function budgetsViewV11(){
    const orders=db.orders.filter(order=>['cotacao','orcamento','aprovacao','pecas','montagem','testes','relatorio','concluida'].includes(order.stage));
    const rows=orders.map(order=>{const budget=ensureBudgetV11(order),approval=ensureApprovalV10(order),eq=getEquipment(order.equipmentId),client=getClient(order.clientId),totals=budgetTotalsV11(order);return `<tr><td><a class="table-link" href="#order/${order.id}">OS #${safe(order.number)}</a><br><small>${safe(budget.proposalCode)}</small></td><td><strong>${safe(client?.name)}</strong><br><small>${safe(eq?.tag)} · ${safe(equipmentDescription(eq))}</small></td><td>${badge(stageLabel(order.stage),stageTone(order.stage))}</td><td>${badge(budget.status,budgetStatusToneV11(budget.status))}</td><td>${badge(approval.status,approvalToneV10(approval.status))}</td><td><strong>${moneyV11(totals.total)}</strong></td><td><div class="row-actions"><a class="btn btn-light btn-sm" href="#order/${order.id}">Abrir fluxo</a><a class="btn btn-primary btn-sm" href="#proposal/${order.id}">Ver proposta</a></div></td></tr>`;}).join('');
    return shell(`<div class="page">${pageHead('Propostas e Orçamentos','Peças, formação de preço, revisão interna, envio e aprovação do cliente em uma única fila.')}<div class="grid kpi-grid dashboard-kpis">${kpi(orders.filter(order=>order.stage==='cotacao').length,'Peças do orçamento','search','bg-teal','#orders/cotacao','Ver peças')}${kpi(orders.filter(order=>order.stage==='orcamento').length,'Em revisão','file','bg-purple','#orders/orcamento','Ver propostas')}${kpi(orders.filter(order=>ensureBudgetV11(order).status===BUDGET_STATUS_V11.REVIEW).length,'Aguardando revisão','clock','bg-amber','#orders/orcamento','Revisar')}${kpi(orders.filter(order=>order.stage==='aprovacao').length,'Com o cliente','users','bg-amber','#orders/aprovacao','Ver aprovações')}</div><section class="card"><div class="card-head"><div><h2>Controle comercial por OS</h2><p>Comprar só é liberado depois que o orçamento foi revisado e autorizado.</p></div></div><div class="table-wrap"><table class="table"><thead><tr><th>OS / Proposta</th><th>Cliente / Equipamento</th><th>Etapa</th><th>Orçamento</th><th>Cliente</th><th>Total</th><th>Ações</th></tr></thead><tbody>${rows||'<tr><td colspan="7"><div class="empty">Nenhum orçamento em andamento.</div></td></tr>'}</tbody></table></div></section></div>`,'budgets');
  }

  dashboardView=function(){
    const counts=Object.fromEntries(STAGES.map(stage=>[stage.id,db.orders.filter(order=>order.stage===stage.id).length])),openCount=db.orders.filter(order=>order.stage!=='concluida').length,pendingParts=db.orders.flatMap(order=>order.parts||[]).filter(part=>!['Recebida','Separada','Instalada'].includes(part.status)).length,pendingReports=db.orders.filter(order=>order.stage==='relatorio'&&!order.report?.sent).length,overdue=db.orders.filter(order=>order.stage!=='concluida'&&order.dueDate&&order.dueDate<todayISO()).length;
    const color={entrada:'#8793a1',diagnostico:'#c9202f',cotacao:'#2f8790',orcamento:'#6a5a8c',aprovacao:'#d28a00',pecas:'#e69a13',montagem:'#62556e',testes:'#477a7c',relatorio:'#356b91',concluida:'#239257'};
    const queue=STAGES.map(stage=>{const list=db.orders.filter(order=>order.stage===stage.id);return `<section class="kanban-col"><a class="kanban-head kanban-head-link" href="#orders/${stage.id}" style="border-bottom-color:${color[stage.id]}"><span>${safe(stage.label)}</span><span>${list.length} ${icon('arrow',12)}</span></a><div class="kanban-list">${list.slice(0,4).map(order=>{const eq=getEquipment(order.equipmentId),client=getClient(order.clientId);return `<article class="os-mini" tabindex="0" role="button" data-action="open-order" data-id="${order.id}"><strong>OS #${safe(order.number)}</strong><p>${safe(equipmentDescription(eq))}</p><p>${safe(client?.name)}</p><div class="mini-status">${stage.id==='orcamento'?badge(ensureBudgetV11(order).status,budgetStatusToneV11(ensureBudgetV11(order).status)):stage.id==='aprovacao'?badge(approvalLabelV10(order),approvalToneV10(approvalLabelV10(order))):badge(formatDate(order.dueDate),order.dueDate&&order.dueDate<todayISO()?'red':'gray')}</div></article>`;}).join('')||'<div class="empty compact"><span>Nenhuma OS</span></div>'}</div></section>`;}).join('');
    return shell(`<div class="page dashboard-page">${pageHead('Olá, Administrador!','Fluxo completo: diagnóstico, peças do orçamento, revisão da proposta, aprovação, compra e execução.',`<button class="btn btn-primary" data-action="new-order">${icon('plus')} Nova ordem de serviço</button>`)}<div class="grid kpi-grid dashboard-kpis v11-kpis">${kpi(openCount,'OS abertas','clipboard','bg-blue','#orders/open','Escolher OS')}${kpi(counts.diagnostico,'Em diagnóstico','tools','bg-red','#orders/diagnostico','Abrir Oficina')}${kpi(counts.cotacao,'Peças em cotação','search','bg-teal','#orders/cotacao','Abrir peças')}${kpi(counts.orcamento,'Revisão da proposta','file','bg-purple','#budgets','Abrir propostas')}${kpi(counts.aprovacao,'Aguardando cliente','clock','bg-amber','#orders/aprovacao','Ver clientes')}${kpi(counts.pecas,'Compra e materiais','box','bg-amber','#parts','Abrir Compras')}${kpi(counts.montagem+counts.testes,'Execução / Qualidade','chart','bg-teal','#workshop','Abrir Oficina')}${kpi(pendingReports,'Para relatórios','file','bg-blue','#reports','Abrir relatórios')}</div><section class="card queue-card"><div class="card-head"><div><h2>Fila de trabalho por etapa</h2><p>As peças são definidas antes da revisão da proposta; comprar e montar somente após a aprovação do cliente.</p></div><a href="#orders/open" class="table-link">Ver todas as OS abertas</a></div><div class="card-body"><div class="kanban" data-preserve-scroll="dashboard-kanban">${queue}</div></div></section><div class="grid dashboard-secondary"><section class="card"><div class="card-head"><h2>Controle comercial</h2></div><div class="card-body alert-list"><a class="alert-item alert-link" href="#orders/cotacao"><div class="alert-icon tone-blue">${icon('search')}</div><div><strong>${counts.cotacao} OS com peças em cotação</strong><p>Fornecedor, custo unitário e prazo ainda sendo definidos.</p></div>${icon('arrow',16)}</a><a class="alert-item alert-link" href="#budgets"><div class="alert-icon tone-purple">${icon('file')}</div><div><strong>${counts.orcamento} propostas em revisão</strong><p>Valores comerciais e revisão interna antes do envio.</p></div>${icon('arrow',16)}</a><a class="alert-item alert-link" href="#orders/aprovacao"><div class="alert-icon tone-amber">${icon('clock')}</div><div><strong>${counts.aprovacao} aguardando cliente</strong><p>Compra e montagem continuam bloqueadas.</p></div>${icon('arrow',16)}</a></div></section><section class="card"><div class="card-head"><h2>Alertas operacionais</h2></div><div class="card-body alert-list"><a class="alert-item alert-link" href="#parts"><div class="alert-icon tone-red">${icon('alert')}</div><div><strong>${pendingParts} peças pendentes</strong><p>Cotar, comprar, receber ou separar.</p></div>${icon('arrow',16)}</a><a class="alert-item alert-link" href="#orders/open"><div class="alert-icon tone-amber">${icon('clock')}</div><div><strong>${overdue} ordens atrasadas</strong><p>Prazo previsto ultrapassado.</p></div>${icon('arrow',16)}</a></div></section></div></div>`,'dashboard');
  };

  const reportDocumentBeforeV11=reportDocumentV5;
  reportDocumentV5=function(order){const budget=ensureBudgetV11(order),totals=budgetTotalsV11(order);let html=reportDocumentBeforeV11(order);const block=`<div class="report-budget-block-v11"><h2>Proposta e autorização comercial</h2><div class="report-info-grid"><article><span>Proposta</span><strong>${safe(budget.proposalCode)}</strong><p>Revisão ${budget.revision} · ${safe(budget.billingType)}</p></article><article><span>Valor autorizado</span><strong>${moneyV11(totals.total)}</strong><p>${safe(budget.paymentTerms)}</p></article></div><p><strong>Escopo comercial:</strong> ${safe(budget.technicalScope||'Não aplicável.')}</p><p><strong>Garantia:</strong> ${safe(budget.warranty||'Não informada.')}</p></div>`;return html.replace('<div class="report-approval-block-v10">',`${block}<div class="report-approval-block-v10">`);};

  const shellBeforeV11=shell;
  shell=function(content,route,portal=false,portalClientId=''){return shellBeforeV11(content,route,portal,portalClientId).replace(/<small>v10<\/small>/g,'<small>v12</small>').replace(/<small>v11<\/small>/g,'<small>v12</small>').replace('Gestão de oficina, peças e relatórios','Gestão de oficina, orçamentos e relatórios');};

  render=function(options={}){
    const {route,param}=parseRoute(),routeKey=`${route}/${param||''}`,resetScroll=options?.resetScroll===true||Boolean(renderedRouteKeyV7&&renderedRouteKeyV7!==routeKey),state=resetScroll?null:captureUIStateV7();
    const views={dashboard:dashboardView,orders:()=>ordersView(param),clients:clientsView,client:()=>clientDetailView(param),equipment:equipmentView,parts:()=>partsView(param),budgets:budgetsViewV11,proposal:()=>proposalViewV11(param),workshop:workshopView,reports:()=>reportsView(param),portal:()=>portalView(param),'portal-report':()=>portalReportViewV8(param),settings:settingsView,order:()=>orderDetailView(param)};
    try{document.getElementById('app').innerHTML=(views[route]||notFoundView)();renderedRouteKeyV7=routeKey;requestAnimationFrame(()=>{if(resetScroll)window.scrollTo(0,0);else restoreUIStateV7(state);});}catch(error){console.error('Falha ao renderizar',error);document.getElementById('app').innerHTML=`<div class="fatal-error"><h1>Não foi possível abrir esta tela</h1><p>${safe(error.message)}</p><a href="#dashboard">Voltar ao dashboard</a></div>`;}
  };

  function updateBudgetPreviewV11(){const {route,param}=parseRoute();if(route!=='order')return;const order=getOrder(param);if(order?.stage!=='orcamento')return;collectBudgetV11(order);const total=document.getElementById('budget-total-preview-v11');if(total)total.textContent=moneyV11(budgetTotalsV11(order).total);}

  const handleV8SecurityActionsBeforeV11=handleV8SecurityActions;
  handleV8SecurityActions=function(event){
    const target=event.target.closest('[data-action]');if(!target)return false;const action=target.dataset.action,stop=()=>{event.preventDefault();event.stopImmediatePropagation();};
    if(action==='add-supplier-quote-v11'){stop();openSupplierQuoteModalV11(target.dataset.order,target.dataset.part);return true;}
    if(action==='edit-supplier-quote-v11'){stop();openSupplierQuoteModalV11(target.dataset.order,target.dataset.part,target.dataset.quote);return true;}
    if(action==='save-supplier-quote-v11'){stop();saveSupplierQuoteV11();return true;}
    if(action==='select-supplier-quote-v11'){stop();selectSupplierQuoteV11(target.dataset.order,target.dataset.part,target.dataset.quote);return true;}
    if(action==='remove-supplier-quote-v11'){stop();removeSupplierQuoteV11(target.dataset.order,target.dataset.part,target.dataset.quote);return true;}
    if(action==='save-budget-v11'){stop();saveBudgetV11(target.dataset.id);return true;}
    if(action==='submit-budget-review-v11'){stop();submitBudgetReviewV11(target.dataset.id);return true;}
    if(action==='approve-budget-internal-v11'){stop();openInternalBudgetApprovalV11(target.dataset.id);return true;}
    if(action==='confirm-budget-internal-v11'){stop();confirmInternalBudgetV11(target.dataset.id);return true;}
    if(action==='send-budget-client-v11'){stop();sendBudgetToClientV11(target.dataset.id);return true;}
    if(action==='reopen-budget-v11'){stop();reopenBudgetV11(target.dataset.id);return true;}
    if(action==='view-proposal-v11'){stop();location.hash=`#proposal/${target.dataset.id}`;return true;}
    if(action==='print-proposal-v11'){stop();setTimeout(()=>window.print(),60);return true;}
    return handleV8SecurityActionsBeforeV11(event);
  };

  document.addEventListener('input',event=>{if(event.target.matches('.budget-calc-v11,#budget-billing-type-v11'))updateBudgetPreviewV11();});



  /* =========================
     AR7 V12 — persistência de formulários, dashboards funcionais e proposta profissional
     ========================= */
  function portalDashboardHrefV12(){const client=resolvePortalClientV8?.()||db.clients?.[0];return client?`#portal/${client.id}`:'#portal';}

  const pageHeadBeforeV12=pageHead;
  pageHead=function(title,subtitle,actions=''){
    const {route}=parseRoute();
    const portalRoute=route==='portal'||route==='portal-report';
    const back=route==='dashboard'||route==='portal'?'' : `<a class="btn btn-light dashboard-back-v12" href="${portalRoute?portalDashboardHrefV12():'#dashboard'}">${icon('home',15)} ${portalRoute?'Painel da empresa':'Painel principal'}</a>`;
    return pageHeadBeforeV12(title,subtitle,`${back}${actions||''}`);
  };

  function persistCurrentWorkspaceV12(){
    const {route,param}=parseRoute();
    try{
      if(route==='order'&&param){const order=getOrder(param);if(order)saveStageData(order,false);}
      if(route==='reports'&&param){const order=getOrder(param);if(order)saveReportData(order.id,false);}
      if(currentModal&&newOrderDraft)saveWizardFormLoose();
    }catch(error){console.warn('Rascunho não pôde ser salvo',error);}
  }
  let draftTimerV12=0;
  function scheduleDraftSaveV12(){clearTimeout(draftTimerV12);draftTimerV12=setTimeout(()=>persistCurrentWorkspaceV12(),120);}

  function refreshQuotationPreviewV12(order){
    if(!order||order.stage!=='cotacao')return;
    collectQuotationV11(order);const totals=quotationTotalsV11(order);
    const parts=document.getElementById('quotation-parts-preview-v12'),total=document.getElementById('quotation-total-preview-v12');
    if(parts)parts.textContent=moneyV11(totals.partsCost);if(total)total.textContent=moneyV11(totals.totalCost);saveDB();
  }
  function refreshBudgetPreviewV12(order){
    if(!order||order.stage!=='orcamento')return;
    collectBudgetV11(order);const totals=budgetTotalsV11(order),quotation=quotationTotalsV11(order),budget=ensureBudgetV11(order);
    const total=document.getElementById('budget-total-preview-v11'),cost=document.getElementById('budget-cost-preview-v12'),margin=document.getElementById('budget-margin-preview-v12'),summary=document.getElementById('budget-summary-preview-v12'),terms=document.getElementById('budget-terms-preview-v12');
    if(total)total.textContent=moneyV11(totals.total);if(cost)cost.textContent=moneyV11(quotation.totalCost);if(margin)margin.textContent=`Margem bruta estimada: ${moneyV11(totals.total-quotation.totalCost)}`;
    if(summary)summary.innerHTML=budgetSummaryTableV11(order,true);
    if(terms)terms.innerHTML=`<p><strong>Pagamento:</strong> ${safe(budget.paymentTerms||'—')}</p><p><strong>Prazo:</strong> ${safe(budget.executionDays||'0')} dias úteis após aprovação e disponibilidade dos materiais.</p><p><strong>Validade:</strong> ${formatDate(budget.validUntil)}</p>`;
    saveDB();
  }

  const proposalDocumentBeforeV12=proposalDocumentV11;
  const SOFTWARE_STUDIO_V203={name:'Nexora Sistemas',tagline:'Tecnologia que organiza operações.'};
  function developerCreditV203(context='Plataforma e experiência digital'){
    return `<div class="developer-credit-v203"><span>${safe(context)}</span><span class="developer-credit-by-v203">Desenvolvido por</span><strong>${safe(SOFTWARE_STUDIO_V203.name)}</strong><small>${safe(SOFTWARE_STUDIO_V203.tagline)}</small></div>`;
  }
  proposalDocumentV11=function(order){
    const budget=ensureBudgetV11(order),totals=budgetTotalsV11(order),client=getClient(order.clientId),eq=getEquipment(order.equipmentId),today=new Intl.DateTimeFormat('pt-BR').format(new Date());
    const partRows=(order.parts||[]).map((part,index)=>{const quote=selectedQuoteV11(part);return `<tr><td>${index+1}</td><td><strong>${safe(part.name)}</strong><br><small>${safe(part.position||'Aplicação conforme desmontagem')}</small></td><td>${safe(part.code||'—')}</td><td>${safe(part.dimensions||'—')}</td><td>${safe(partQuantity(part))}</td><td>${safe(quote?.brand||quote?.supplier||'Conforme especificação técnica')}</td></tr>`;}).join('');
    const diagnosis=safe(order.records?.diagnosis||'A avaliação técnica foi realizada a partir das condições apresentadas pelo equipamento no recebimento e durante a desmontagem. Os pontos identificados orientam o escopo recomendado nesta proposta.');
    const scope=safe(budget.technicalScope||'Execução dos serviços corretivos e das verificações necessárias para restabelecer condições adequadas de funcionamento, com registros vinculados à Ordem de Serviço.');
    const notes=budget.commercialNotes?`<div class="proposal-note-v12 proposal-note-v203"><strong>Observações comerciais</strong><p>${safe(budget.commercialNotes)}</p></div>`:'';
    const contactLine=[client?.contact,client?.email].filter(Boolean).map(safe).join(' · ')||'Contato comercial não informado';
    return `<div class="report-document proposal-document-v11 proposal-document-v12 proposal-document-v203" id="printable-report">
      <section class="report-page proposal-cover-v12 proposal-cover-v203">
        <div class="proposal-cover-top-v12 proposal-cover-top-v203"><img src="./assets/ar7-logo.png" alt="AR7 Elétrica"><div><span>PROPOSTA TÉCNICO-COMERCIAL</span><strong>${safe(budget.proposalCode)}</strong></div></div>
        <div class="proposal-cover-main-v12 proposal-cover-main-v203"><div class="proposal-cover-line-v12"></div><span>SOLUÇÃO TÉCNICA PARA MANUTENÇÃO ELETROMECÂNICA</span><h1>${safe(equipmentDescription(eq))}</h1><p>Confiabilidade para o equipamento. Clareza para a sua decisão.</p></div>
        <div class="proposal-cover-company-v12 proposal-cover-company-v203"><small>PROPOSTA PREPARADA PARA</small><strong>${safe(client?.name||'Empresa contratante')}</strong><span>${safe(eq?.tag||'Equipamento sem TAG')} · ${safe(eq?.serial||'Número de série não informado')}</span></div>
        <div class="proposal-cover-meta-v12 proposal-cover-meta-v203"><div><small>Emissão</small><strong>${today}</strong></div><div><small>Validade</small><strong>${formatDate(budget.validUntil)}</strong></div><div><small>Revisão</small><strong>R${String(budget.revision).padStart(2,'0')}</strong></div><div><small>Atendimento</small><strong>${safe(budget.billingType)}</strong></div></div>
        <div class="proposal-cover-trust-v203"><span>Diagnóstico rastreável</span><span>Execução documentada</span><span>Validação técnica</span></div>
        <div class="proposal-cover-message-v12 proposal-cover-message-v203">Esta proposta transforma o diagnóstico da OS ${safe(order.number)} em um plano de execução objetivo: o que será feito, quais materiais estão previstos, quanto será investido e quais critérios serão usados antes da liberação do equipamento.</div>
        ${developerCreditV203('Sistema de gestão e documentos')}
        <div class="report-footer"><span>AR7 Elétrica · Documento comercial controlado</span><span>${safe(budget.proposalCode)} · 1/3</span></div>
      </section>
      <section class="report-page proposal-technical-v12 proposal-technical-v203">
        <div class="report-page-header"><img src="./assets/ar7-logo.png" alt="AR7"><div><span>${safe(budget.proposalCode)}</span><strong>Entendimento técnico e solução recomendada</strong></div></div>
        <div class="proposal-intro-v12 proposal-intro-v203"><span>UMA PROPOSTA CONSTRUÍDA SOBRE O QUE FOI ENCONTRADO</span><strong>Objetivo claro: recuperar confiabilidade sem perder rastreabilidade.</strong><p>Esta proposta foi preparada a partir das informações registradas na OS ${safe(order.number)} e da avaliação do equipamento ${safe(equipmentDescription(eq))}. A recomendação abaixo reúne somente o necessário para tratar as condições identificadas, validar o resultado e devolver ao cliente um histórico técnico consistente do serviço.</p></div>
        <div class="report-info-grid proposal-context-v203"><article><span>Empresa atendida</span><strong>${safe(client?.name||'—')}</strong><p>${contactLine}</p></article><article><span>Equipamento</span><strong>${safe(equipmentDescription(eq))}</strong><p>${safe(eq?.tag||'Sem TAG')} · ${safe(eq?.manufacturer||'Fabricante não informado')} · ${safe(eq?.power||'Potência não informada')}</p></article><article><span>Solicitação registrada</span><strong>OS ${safe(order.number)}</strong><p>${safe(order.defect||'Defeito informado não registrado.')}</p></article><article><span>Referência comercial</span><strong>${safe(budget.proposalCode)}</strong><p>Revisão R${String(budget.revision).padStart(2,'0')} · validade ${formatDate(budget.validUntil)}</p></article></div>
        <div class="proposal-numbered-v12 proposal-numbered-v203"><span>01</span><div><h2>Condição identificada</h2><p>${diagnosis}</p></div></div>
        <div class="proposal-numbered-v12 proposal-numbered-v203"><span>02</span><div><h2>Solução recomendada</h2><p>${scope}</p></div></div>
        <div class="proposal-value-strip-v203"><article><strong>Intervenção rastreável</strong><p>Cada etapa fica vinculada à OS, reduzindo dúvidas sobre o que foi executado e por quem.</p></article><article><strong>Validação antes da liberação</strong><p>Testes e verificações finais são registrados antes da conclusão técnica do serviço.</p></article><article><strong>Entrega documentada</strong><p>O cliente recebe relatório técnico com materiais, medições aplicáveis, fotos e responsáveis.</p></article></div>
        <div class="proposal-journey-v203"><div><span>01</span><strong>Confirmar escopo</strong><small>Aprovação formal da proposta</small></div><div><span>02</span><strong>Executar</strong><small>Intervenção e registros por OS</small></div><div><span>03</span><strong>Validar</strong><small>Testes e conferência técnica</small></div><div><span>04</span><strong>Documentar</strong><small>Relatório e histórico do ativo</small></div></div>
        <div class="proposal-standard-v12 proposal-standard-v203"><h3>Compromissos de execução</h3><ul><li>Qualquer necessidade adicional que altere valor, material ou prazo será comunicada antes da execução.</li><li>Os serviços serão registrados na OS com evidências compatíveis com a intervenção realizada.</li><li>Os testes finais serão conduzidos conforme as características do equipamento e os recursos técnicos aplicáveis.</li><li>O prazo de execução começa após a aprovação formal e a disponibilidade dos materiais necessários.</li></ul></div>
        <div class="proposal-acceptance-criteria-v12 proposal-acceptance-criteria-v203"><strong>Critério de liberação técnica</strong><p>O equipamento será liberado após a conclusão do escopo aprovado, a avaliação dos testes finais e a revisão do responsável técnico da AR7 Elétrica. Eventuais limitações ou recomendações de operação serão registradas no relatório de conclusão.</p></div>
        <div class="proposal-deliverables-v203"><span>AO FINAL, O CLIENTE RECEBE</span><div><article><strong>Relatório técnico final</strong><p>Diagnóstico, serviços, testes, conclusão e recomendações reunidos em um documento controlado.</p></article><article><strong>Evidências da intervenção</strong><p>Fotos e registros técnicos vinculados à OS para facilitar consulta, auditoria e comunicação interna.</p></article><article><strong>Histórico do equipamento</strong><p>Componentes, responsáveis e revisões preservados para apoiar futuras decisões de manutenção.</p></article></div></div>
        <div class="report-footer"><span>AR7 Elétrica · Solução técnica</span><span>${safe(budget.proposalCode)} · 2/3</span></div>
      </section>
      <section class="report-page proposal-commercial-v12 proposal-commercial-v203">
        <div class="report-page-header"><img src="./assets/ar7-logo.png" alt="AR7"><div><span>${safe(budget.proposalCode)}</span><strong>Investimento, materiais e condições</strong></div></div>
        <div class="proposal-commercial-lead-v203"><span>INVESTIMENTO PARA EXECUÇÃO DO ESCOPO</span><strong>Valores transparentes e condições definidas antes do início do serviço.</strong><p>Os itens abaixo correspondem ao escopo apresentado nesta revisão. Qualquer alteração necessária durante a execução será submetida à aprovação antes de gerar impacto comercial.</p></div>
        <h2 class="report-section-title">Materiais e componentes previstos</h2><table class="report-table proposal-parts-table-v12 proposal-parts-table-v203"><thead><tr><th>#</th><th>Item / aplicação</th><th>Código</th><th>Medidas</th><th>Quantidade</th><th>Referência</th></tr></thead><tbody>${partRows||'<tr><td colspan="6">O escopo desta revisão não prevê fornecimento de peças.</td></tr>'}</tbody></table>
        <div class="proposal-investment-v12 proposal-investment-v203"><div><span>INVESTIMENTO TOTAL</span><strong>${moneyV11(totals.total)}</strong><small>Valor correspondente ao escopo, materiais e condições desta revisão.</small></div>${budgetSummaryTableV11(order,true)}</div>
        <div class="proposal-conditions-grid-v12 proposal-conditions-grid-v203"><article><span>Condição de pagamento</span><strong>${safe(budget.paymentTerms)}</strong></article><article><span>Prazo estimado</span><strong>${safe(budget.executionDays)} dias úteis</strong><small>Contados após aprovação e disponibilidade integral dos materiais.</small></article><article><span>Validade da proposta</span><strong>${formatDate(budget.validUntil)}</strong></article><article><span>Garantia</span><strong>${safe(budget.warranty)}</strong></article></div>${notes}
        <div class="proposal-next-step-v203"><div><span>PRÓXIMO PASSO</span><strong>Aprovar esta revisão para liberar o planejamento do serviço.</strong><p>Com o aceite, a AR7 Elétrica fica autorizada a executar o escopo descrito e adquirir os materiais previstos. Qualquer mudança posterior deverá ser formalizada em nova revisão para manter o histórico comercial íntegro.</p></div></div>
        <div class="proposal-acceptance-v12 proposal-acceptance-v203"><div><span>ACEITE DA PROPOSTA</span><p>Confirmação da empresa contratante referente à revisão ${safe(budget.proposalCode)}.</p></div><div class="proposal-signatures-v12 proposal-signatures-v203"><div><span>Nome e função</span></div><div><span>Data</span></div><div><span>Assinatura / autorização</span></div></div></div>
        ${developerCreditV203('Plataforma AR7')}
        <div class="report-footer"><span>AR7 Elétrica · Condições comerciais</span><span>${safe(budget.proposalCode)} · 3/3</span></div>
      </section>
    </div>`;
  };

  function partsFilterV12(filter,item){if(!filter||filter==='all')return true;if(filter==='solicitada')return item.status==='Solicitada';if(filter==='comprada')return item.status==='Comprada';if(filter==='pendente')return !['Recebida','Separada','Instalada'].includes(item.status);if(filter==='separada')return item.status==='Separada';return item.status.toLocaleLowerCase('pt-BR')===filter.toLocaleLowerCase('pt-BR');}
  partsView=function(filter=''){
    const all=db.orders.flatMap(order=>(order.parts||[]).map(part=>({...part,order}))),parts=all.filter(item=>partsFilterV12(filter,item));
    const rows=parts.map(item=>{const eq=getEquipment(item.order.equipmentId),commercial=item.purchase||{},next=purchaseNextStatusV8(item.status);return `<tr><td>${item.photo?`<img class="part-photo" src="${safe(item.photo)}" alt="Foto da peça">`:'<span class="part-photo-placeholder">—</span>'}</td><td><div class="part-technical"><strong>${safe(item.name)}</strong><small>Código: ${safe(item.code||'não informado')}</small><small>Medidas: ${safe(item.dimensions||'não informadas')}</small><small>Aplicação: ${safe(item.position||'não informada')}</small></div></td><td><a class="table-link" href="#order/${item.order.id}">OS #${safe(item.order.number)}</a><br>${safe(eq?.tag||'—')} · ${safe(equipmentDescription(eq))}</td><td>${safe(partQuantity(item))}</td><td>${badge(item.status,partTone(item.status))}</td><td><div class="commercial-summary"><strong>${safe(commercial.supplier||'Compras ainda não preencheu')}</strong><span>${commercial.expectedDate?`Previsão: ${formatDate(commercial.expectedDate)}`:'Sem previsão'}</span><span>${commercial.quote?`Cotação/Pedido: ${safe(commercial.quote)}`:''}</span></div></td><td>${safe(commercial.location||'—')}</td><td><div class="row-actions"><button class="btn btn-light btn-sm" data-action="edit-purchase" data-order="${item.order.id}" data-part="${item.id}">${icon('edit',14)} Dados da compra</button>${next?`<button class="btn btn-primary btn-sm" data-action="advance-part" data-order="${item.order.id}" data-part="${item.id}">Marcar como ${safe(next)}</button>`:`<span class="purchase-handoff-status">${item.status==='Separada'?'Aguardando instalação na Oficina':'Instalada pela Oficina'}</span>`}</div></td></tr>`;}).join('');
    const pending=all.filter(part=>!['Recebida','Separada','Instalada'].includes(part.status)).length;
    return shell(`<div class="page">${pageHead('Peças e Compras',filter?`Filtro atual: ${safe(filter)}.`:'Acompanhe cada material desde a solicitação até a separação para a Oficina.',`<button class="btn btn-primary" data-action="new-part-global">${icon('plus')} Nova solicitação técnica</button>`)}<div class="grid kpi-grid dashboard-kpis">${kpi(all.length,'Itens rastreados','gear','bg-blue','#parts/all','Ver todos')}${kpi(all.filter(p=>p.status==='Solicitada').length,'Aguardando Compras','clipboard','bg-red','#parts/solicitada','Abrir solicitações')}${kpi(all.filter(p=>p.status==='Comprada').length,'Comprados','box','bg-amber','#parts/comprada','Ver comprados')}${kpi(pending,'Pendentes de recebimento','clock','bg-purple','#parts/pendente','Ver pendências')}</div><section class="card"><div class="card-head"><div><h2>Fila de materiais</h2><p>${parts.length} item(ns) neste filtro. A instalação continua exclusiva da Oficina.</p></div><a class="table-link" href="#dashboard">Painel principal</a></div><div class="table-wrap" data-preserve-scroll="parts-table"><table class="table"><thead><tr><th>Foto</th><th>Especificação técnica</th><th>OS / Equipamento</th><th>Qtd.</th><th>Status</th><th>Dados de Compras</th><th>Local</th><th>Ações</th></tr></thead><tbody>${rows||'<tr><td colspan="8"><div class="empty">Nenhum item encontrado neste filtro.</div></td></tr>'}</tbody></table></div></section></div>`,'parts');
  };

  workshopView=function(){
    const stages=['diagnostico','montagem','testes'],orders=db.orders.filter(order=>stages.includes(order.stage)),rows=orders.map(order=>{const client=getClient(order.clientId),eq=getEquipment(order.equipmentId),req=stageRequirements(order),done=req.filter(item=>item.ok).length;return `<tr><td><a class="table-link" href="#order/${order.id}">OS #${safe(order.number)}</a></td><td><strong>${safe(client?.name)}</strong><br><small>${safe(eq?.tag)} · ${safe(equipmentDescription(eq))}</small></td><td>${badge(stageLabel(order.stage),stageTone(order.stage))}</td><td>${done}/${req.length} requisitos</td><td>${safe(order.technician||'A definir')}</td><td>${formatDate(order.dueDate)}</td><td><a class="btn btn-primary btn-sm" href="#order/${order.id}">Abrir etapa</a></td></tr>`;}).join('');
    return shell(`<div class="page">${pageHead('Oficina','Fila técnica de diagnóstico, montagem e testes finais.')}<div class="grid kpi-grid dashboard-kpis">${kpi(orders.length,'Na Oficina','tools','bg-blue','#workshop','Ver fila')}${kpi(orders.filter(o=>o.stage==='diagnostico').length,'Em diagnóstico','search','bg-red','#orders/diagnostico','Abrir diagnósticos')}${kpi(orders.filter(o=>o.stage==='montagem').length,'Em montagem','tools','bg-purple','#orders/montagem','Abrir montagens')}${kpi(orders.filter(o=>o.stage==='testes').length,'Em testes','chart','bg-teal','#orders/testes','Abrir testes')}</div><section class="card"><div class="card-head"><div><h2>Atividades técnicas abertas</h2><p>Clique em uma OS para continuar exatamente na etapa atual.</p></div></div><div class="table-wrap"><table class="table"><thead><tr><th>OS</th><th>Cliente / equipamento</th><th>Etapa</th><th>Conferência</th><th>Responsável</th><th>Prazo</th><th>Ação</th></tr></thead><tbody>${rows||'<tr><td colspan="7"><div class="empty">Nenhuma atividade técnica aguardando a Oficina.</div></td></tr>'}</tbody></table></div></section></div>`,'workshop');
  };

  function enhancePageV12(){
    document.querySelectorAll('.page-head').forEach(head=>head.classList.add('page-head-v12'));
    document.querySelectorAll('.form-group').forEach(group=>{
      const label=group.querySelector('label'),control=group.querySelector('input:not([type="hidden"]),select,textarea');
      if(label&&control&&!control.getAttribute('aria-label')&&!control.getAttribute('aria-labelledby'))control.setAttribute('aria-label',label.textContent.replace(/\s+/g,' ').trim().replace(/\s*\*$/,''));
    });
    document.querySelectorAll('button:not([type])').forEach(button=>button.type='button');
    const {route}=parseRoute();
    if(route==='clients'){
      document.querySelectorAll('.client-kpis .kpi').forEach((card,index)=>{if(card.matches('a'))return;card.tabIndex=0;if(index<2){card.setAttribute('role','button');card.dataset.scrollV12='client-cards';}else{card.setAttribute('role','link');card.dataset.hrefV12=index===2?'#equipment':'#orders/open';}});
    }
    if(route==='portal'){
      const sections=[...document.querySelectorAll('section.card')];
      const find=(text,id)=>{const section=sections.find(el=>el.querySelector('h2')?.textContent.includes(text));if(section)section.id=id;};
      find('Aprovações pendentes','portal-approvals-v12');find('Andamento dos seus equipamentos','portal-equipment-v12');find('Relatórios disponíveis','portal-reports-v12');
      const targets=['portal-equipment-v12','portal-approvals-v12','portal-equipment-v12','portal-equipment-v12','portal-reports-v12'];
      document.querySelectorAll('.portal-kpis .kpi').forEach((card,index)=>{card.setAttribute('role','button');card.tabIndex=0;card.dataset.scrollV12=targets[index]||'portal-equipment-v12';});
    }
  }

  const renderBeforeV12=render;
  render=function(options={}){renderBeforeV12(options);requestAnimationFrame(enhancePageV12);};

  document.addEventListener('input',event=>{
    const target=event.target;
    if(target.matches('#stage-entry-date,#stage-due-date,#stage-received-by,#stage-delivery-contact,#stage-defect,#stage-condition,#stage-accessories,#stage-record,#quotation-responsible-v11,#quotation-labor-cost-v11,#quotation-third-party-cost-v11,#quotation-other-cost-v11,#quotation-notes-v11,#budget-billing-type-v11,#budget-scope-v11,#budget-parts-markup-v11,#budget-labor-v11,#budget-third-party-v11,#budget-freight-v11,#budget-other-v11,#budget-tax-v11,#budget-discount-v11,#budget-payment-v11,#budget-execution-v11,#budget-warranty-v11,#budget-valid-v11,#budget-recipient-v11,#budget-notes-v11,#report-conclusion,#report-recommendations,#report-recipient,#report-supervisor')){
      const {route,param}=parseRoute(),order=route==='order'?getOrder(param):null;
      if(order?.stage==='cotacao')refreshQuotationPreviewV12(order);else if(order?.stage==='orcamento')refreshBudgetPreviewV12(order);else scheduleDraftSaveV12();
    }
  });
  document.addEventListener('click',event=>{
    const link=event.target.closest('[data-href-v12]');if(link){location.hash=link.dataset.hrefV12;return;}
    const scroll=event.target.closest('[data-scroll-v12]');if(scroll){document.getElementById(scroll.dataset.scrollV12)?.scrollIntoView({behavior:'smooth',block:'start'});return;}
  });
  document.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&event.target.matches('[data-href-v12],[data-scroll-v12],[role=\"button\"][data-action]')){event.preventDefault();event.target.click();}});
  document.addEventListener('click',event=>{if(event.target.closest('[data-action],input[type="file"],a'))persistCurrentWorkspaceV12();},true);
  document.addEventListener('change',event=>{if(event.target.matches('input,select,textarea'))persistCurrentWorkspaceV12();},true);



  /* =========================
     AR7 V13 - relatório técnico separado, aprovação exclusiva pelo portal e área da empresa funcional
     ========================= */
  const PORTAL_APPROVAL_SOURCE_V13='Portal do Cliente';
  const normalizePhotoBeforeV13=normalizePhotoV5;
  normalizePhotoV5=function(photo,defaultCaption=''){const normalized=normalizePhotoBeforeV13(photo,defaultCaption);normalized.observation=String(photo?.observation||'').trim();return normalized;};

  function migrateV13(){
    db.version=13;
    (db.orders||[]).forEach(order=>{
      order.photos=order.photos||{before:[],during:[],assembly:[],after:[]};
      ['before','during','assembly','after'].forEach(group=>{
        order.photos[group]=(order.photos[group]||[]).map(photo=>{
          const normalized=normalizePhotoV5(photo);
          normalized.observation=String(photo?.observation||'').trim();
          return normalized;
        });
      });
      const approval=ensureApprovalV10(order);
      if(['pecas','montagem','testes','relatorio','concluida'].includes(order.stage)){
        approval.status=APPROVAL_STATUS_V10.APPROVED;
        approval.decisionChannel=PORTAL_APPROVAL_SOURCE_V13;
        approval.portalApprovedByClientId=order.clientId;
        approval.portalApprovalId=approval.portalApprovalId||id('pa');
        approval.decidedAt=approval.decidedAt||order.availableSince||new Date().toISOString();
        approval.decidedBy=approval.decidedBy||getClient(order.clientId)?.contact||getClient(order.clientId)?.name||'Cliente';
      }else if(order.stage==='aprovacao' && approval.decisionChannel!==PORTAL_APPROVAL_SOURCE_V13){
        approval.status=APPROVAL_STATUS_V10.WAITING;
        approval.decidedAt='';approval.decidedBy='';approval.portalApprovedByClientId='';approval.portalApprovalId='';
      }
    });
    saveDB();
  }
  migrateV13();

  approvalGrantedV10=function(order){
    const approval=ensureApprovalV10(order);
    return Boolean(
      approval.status===APPROVAL_STATUS_V10.APPROVED &&
      approval.decisionChannel===PORTAL_APPROVAL_SOURCE_V13 &&
      approval.portalApprovedByClientId===order.clientId &&
      approval.portalApprovalId
    );
  };
  approvalPendingV10=function(order){return !approvalGrantedV10(order);};

  confirmManualApprovalV10=function(orderId){
    const order=getOrder(orderId);if(!order)return;
    toast('A aprovação interna não libera a OS. O responsável da empresa precisa aprovar no Portal do Cliente.','error');
  };
  confirmWaiveApprovalV10=function(orderId){
    const order=getOrder(orderId);if(!order)return;
    toast('A dispensa interna não libera compra nem montagem. A empresa precisa confirmar o escopo no portal.','error');
  };
  openManualApprovalModalV10=function(orderId){
    const order=getOrder(orderId);if(!order)return;
    openModal('Aprovação exclusiva da empresa',`<div class="stack"><div class="approval-warning-v10">${icon('alert',22)}<div><strong>A AR7 não pode aprovar em nome do cliente.</strong><p>A proposta da OS #${safe(order.number)} continuará bloqueada até um usuário da empresa acessar o Portal do Cliente e confirmar a autorização.</p></div></div><a class="btn btn-primary" href="#portal/${safe(order.clientId)}" data-action="close-modal">Abrir portal da empresa</a></div>`,`<button class="btn btn-light" data-action="close-modal">Fechar</button>`);
  };
  openWaiveApprovalModalV10=openManualApprovalModalV10;

  const confirmPortalApprovalBeforeV13=confirmPortalApprovalV10;
  confirmPortalApprovalV10=function(orderId){
    const client=resolvePortalClientV8(),order=getOrder(orderId);
    if(!portalOrderAllowedV8(order,client,false))return toast('Esta proposta não pertence à empresa conectada.','error');
    if(!document.getElementById('portal-approval-consent-v10')?.checked)return toast('Marque a confirmação para aprovar.','error');
    const approval=ensureApprovalV10(order);
    if(order.stage!=='aprovacao'||approval.status!==APPROVAL_STATUS_V10.WAITING)return toast('Esta proposta não está aguardando aprovação da empresa.','error');
    approval.status=APPROVAL_STATUS_V10.APPROVED;
    approval.decidedAt=new Date().toISOString();
    approval.decidedBy=client.contact||client.name||'Responsável da empresa';
    approval.decisionChannel=PORTAL_APPROVAL_SOURCE_V13;
    approval.portalApprovedByClientId=client.id;
    approval.portalApprovalId=id('pa');
    approval.clientComment=(document.getElementById('portal-approval-comment-v10')?.value||'').trim();
    moveAfterApprovalV10(order,`${approval.decidedBy} pelo Portal do Cliente`);
    saveDB();closeModal();render({resetScroll:true});toast('Orçamento aprovado pela empresa. Compra ou montagem liberada conforme o fluxo.');
  };

  sendBudgetToClientV11=function(orderId){
    const order=getOrder(orderId);if(!order)return;
    collectBudgetV11(order);
    const budget=ensureBudgetV11(order),totals=budgetTotalsV11(order);
    if(budget.status!==BUDGET_STATUS_V11.INTERNAL_APPROVED)return toast('O supervisor precisa aprovar o orçamento internamente antes do envio.','error');
    if(!budget.recipient.includes('@'))return toast('Informe um e-mail válido da empresa cliente.','error');
    const approval=ensureApprovalV10(order);
    approval.required=true;approval.internalAuthorization=false;
    approval.scope=budget.technicalScope;approval.amount=totals.total.toFixed(2);
    approval.terms=`Pagamento: ${budget.paymentTerms}. Prazo: ${budget.executionDays} dias úteis após aprovação e disponibilidade dos materiais. Garantia: ${budget.warranty}`;
    approval.recipient=budget.recipient;approval.validUntil=budget.validUntil;
    approval.sentAt=new Date().toISOString();approval.decidedAt='';approval.decidedBy='';approval.clientComment='';
    approval.status=APPROVAL_STATUS_V10.WAITING;approval.decisionChannel='';approval.portalApprovedByClientId='';approval.portalApprovalId='';
    budget.sentAt=approval.sentAt;budget.status=BUDGET_STATUS_V11.SENT;
    const from=STAGES.find(item=>item.id==='orcamento'),to=STAGES.find(item=>item.id==='aprovacao');
    order.handoffs=order.handoffs||[];
    if(order.stage!=='aprovacao')order.handoffs.push({fromStage:from.id,toStage:to.id,fromTeam:from.team,toTeam:to.team,at:new Date().toISOString(),note:`Orçamento ${budget.proposalCode} enviado para aprovação exclusiva da empresa.`});
    order.stage='aprovacao';order.availableSince=new Date().toISOString();
    addActivity(`OS ${order.number}: orçamento ${budget.proposalCode} enviado. Aguardando aprovação no portal de ${getClient(order.clientId)?.name||'cliente'}.`);
    saveDB();render({resetScroll:true});toast('Orçamento enviado. A OS permanece bloqueada até a empresa aprovar no portal.');
  };

  const advancePartBeforeV13=advancePart;
  advancePart=function(orderId,partId){
    const order=getOrder(orderId),part=order?.parts?.find(item=>item.id===partId);if(!order||!part)return;
    const next=purchaseNextStatusV8(part.status);
    if(next==='Comprada'&&!approvalGrantedV10(order))return toast('Compra bloqueada. Somente a aprovação feita pela empresa no Portal do Cliente libera este item.','error');
    return advancePartBeforeV13(orderId,partId);
  };

  approvalWorkspaceV11=function(order){
    const approval=ensureApprovalV10(order),budget=ensureBudgetV11(order),client=getClient(order.clientId),eq=getEquipment(order.equipmentId);
    const valid=approvalGrantedV10(order);
    return `<section class="card stage-workspace approval-workspace-v10 approval-workspace-v11 approval-exclusive-v13"><div class="card-head"><div><div class="section-eyebrow">PROPOSTA ${safe(budget.proposalCode)} · REVISÃO ${budget.revision}</div><h2>${valid?'Aprovação confirmada pela empresa':'Aguardando aprovação no Portal do Cliente'}</h2><p>A AR7 pode acompanhar e reenviar a proposta, mas não pode liberar o processo em nome do cliente.</p></div>${badge(valid?'Aprovado no portal':'Bloqueado aguardando empresa',valid?'green':'amber')}</div><div class="card-body stack"><div class="commercial-flow-strip-v11"><span class="done">1 Diagnóstico</span><span class="done">2 Cotação</span><span class="done">3 Orçamento</span><span class="active">4 Empresa</span><span>5 Compra</span></div><div class="portal-approval-lock-v13">${icon(valid?'check':'alert',24)}<div><strong>${valid?'Autorização válida registrada':'Compra e montagem permanecem bloqueadas'}</strong><p>${valid?`Aprovado por ${safe(approval.decidedBy)} em ${formatDateTime(approval.decidedAt)}.`:`A aprovação só será válida quando um usuário de ${safe(client?.name||'empresa cliente')} confirmar a proposta dentro do portal exclusivo da empresa.`}</p></div></div><div class="approval-official-proposal-v11"><div><small>Cliente / equipamento</small><strong>${safe(client?.name)} · ${safe(eq?.tag)}</strong><span>${safe(equipmentDescription(eq))}</span></div><div><small>Escopo enviado</small><p>${safe(budget.technicalScope)}</p></div>${budgetSummaryTableV11(order,true)}<div class="proposal-conditions-v11"><p><strong>Pagamento:</strong> ${safe(budget.paymentTerms)}</p><p><strong>Prazo:</strong> ${safe(budget.executionDays)} dias úteis</p><p><strong>Garantia:</strong> ${safe(budget.warranty)}</p><p><strong>Validade:</strong> ${formatDate(budget.validUntil)}</p></div></div><div class="approval-actions-v10"><button class="btn btn-light" data-action="view-proposal-v11" data-id="${order.id}">${icon('file')} Ver proposta enviada</button><a class="btn btn-primary" href="#portal/${safe(order.clientId)}">Abrir portal da empresa</a></div><div class="approval-context-v10"><strong>Regra de segurança</strong><span>Alterar o status internamente para “Aprovado” não libera a OS. A validação exige o identificador da empresa e o registro gerado pelo portal.</span></div></div></section>`;
  };

  function photoObservationV13(photo){const p=photo||{};return String(p.observation||'').trim();}
  const photoGalleryBeforeV13=photoGalleryV5;
  photoGalleryV5=function(order,group,label,description=''){
    const list=order.photos[group]||[];
    return `<section class="stage-photo-block" data-photo-group="${group}"><div class="stage-photo-head"><div><div class="section-eyebrow">EVIDÊNCIAS · ${list.length} FOTO(S)</div><h3>${safe(label)}</h3>${description?`<p>${safe(description)}</p>`:''}</div><div class="photo-upload-actions-v201"><label class="btn btn-primary btn-sm">${icon('camera',15)} Câmera<input type="file" accept="image/*" capture="environment" hidden data-action="photo-upload" data-order="${order.id}" data-group="${group}"></label><label class="btn btn-light btn-sm">${icon('file',15)} Galeria<input type="file" accept="image/*" multiple hidden data-action="photo-upload" data-order="${order.id}" data-group="${group}"></label></div></div><div class="photo-grid photo-grid-v5">${list.map((photo,index)=>{const p=normalizePhotoV5(photo),obs=photoObservationV13(photo);return `<article class="photo-card-v5 photo-card-v13">${annotatedPhoto(p,'','Foto '+label)}<div class="photo-card-actions"><button class="btn btn-light btn-sm" data-action="edit-photo" data-order="${order.id}" data-group="${group}" data-index="${index}">${icon('edit',14)} Setas e observações</button><button class="icon-danger" data-action="delete-photo" data-order="${order.id}" data-group="${group}" data-index="${index}" aria-label="Excluir foto">${icon('trash',14)}</button></div><div class="photo-metadata-v13"><strong>${safe(p.caption||`${label} - foto ${index+1}`)}</strong><p>${obs?safe(obs):'Sem observação técnica registrada.'}</p></div></article>`;}).join('')||`<label class="photo-empty-v5">${icon('camera',30)}<strong>Nenhuma foto adicionada</strong><span>Use Câmera ou Galeria acima. Fotos grandes são compactadas automaticamente antes de salvar.</span><input type="file" accept="image/*" multiple hidden data-action="photo-upload" data-order="${order.id}" data-group="${group}"></label>`}</div></section>`;
  };

  openPhotoEditor=function(orderId,group,index){
    const order=getOrder(orderId),photo=order?.photos?.[group]?.[Number(index)];if(!photo)return;
    const normalized=normalizePhotoV5(photo);normalized.observation=photoObservationV13(photo);order.photos[group][Number(index)]=normalized;
    arrowEditorState={orderId,group,index:Number(index),annotations:normalized.annotations.map(a=>({...a})),caption:normalized.caption||'',observation:normalized.observation||'',color:'#c9202f',width:6,drawing:null};
    openModal('Editar imagem técnica',`<div class="annotation-editor"><div class="annotation-toolbar"><label>Cor <input type="color" id="arrow-color" value="#c9202f"></label><label>Espessura <input type="range" id="arrow-width" min="2" max="12" value="6"></label><button class="btn btn-light btn-sm" data-action="undo-arrow">Desfazer</button><button class="btn btn-light btn-sm" data-action="clear-arrows">Limpar setas</button></div><div class="annotation-canvas" id="annotation-canvas" style="aspect-ratio:${normalized.width}/${normalized.height}"><img src="${safe(normalized.src)}" alt="Foto para anotação" draggable="false"><svg id="annotation-svg" viewBox="0 0 1000 1000" preserveAspectRatio="none"></svg></div><div class="form-grid photo-fields-v13"><div class="form-group span-2"><label>Título curto da imagem</label><input class="input" id="photo-caption" value="${safe(normalized.caption)}" placeholder="Ex.: Desgaste no alojamento do mancal"></div><div class="form-group span-2"><label>Observação técnica da imagem</label><textarea class="textarea" id="photo-observation-v13" placeholder="Descreva o problema, a peça indicada pela seta, a condição encontrada ou o serviço executado.">${safe(normalized.observation)}</textarea><small>Esta observação aparecerá no relatório técnico junto da fotografia.</small></div></div><p class="annotation-help">Arraste o dedo ou mouse sobre a foto no sentido da seta.</p></div>`,`<button class="btn btn-light" data-action="close-modal">Cancelar</button><button class="btn btn-primary" data-action="save-photo-annotations">${icon('save')} Salvar imagem</button>`);
    updateArrowEditorSvg();
  };
  savePhotoAnnotations=function(){
    const state=arrowEditorState,order=getOrder(state?.orderId),photo=order?.photos?.[state.group]?.[state.index];if(!photo)return;
    photo.annotations=state.annotations.map(a=>({...a}));
    photo.caption=(document.getElementById('photo-caption')?.value||'').trim();
    photo.observation=(document.getElementById('photo-observation-v13')?.value||'').trim();
    saveDB();arrowEditorState=null;closeModal();render();toast('Setas, título e observação técnica salvos.');
  };

  reportPhotoSection=function(title,photos,orderNumber){
    const normalized=(photos||[]).map(photo=>{const p=normalizePhotoV5(photo);p.observation=photoObservationV13(photo);return p;});if(!normalized.length)return '';
    const pages=[];for(let index=0;index<normalized.length;index+=2)pages.push(normalized.slice(index,index+2));
    return pages.map((page,pageIndex)=>`<section class="report-page report-photo-page report-photo-page-v13"><div class="report-page-header"><img src="./assets/ar7-logo.png" alt="AR7"><div><span>RELATÓRIO TÉCNICO · OS ${safe(orderNumber)}</span><strong>${safe(title)}${pages.length>1?` · ${pageIndex+1}/${pages.length}`:''}</strong></div></div><div class="report-photo-grid">${page.map((photo,index)=>`<figure>${reportPhotoSvgV7(photo)}<figcaption><strong>${safe(photo.caption||`Foto ${pageIndex*2+index+1}`)}</strong><span>${photo.observation?safe(photo.observation):'Registro fotográfico sem observação técnica complementar.'}</span></figcaption></figure>`).join('')}</div><div class="report-standard-note">As setas, títulos e observações identificam os pontos relevantes da imagem e integram a rastreabilidade técnica desta ordem de serviço.</div><div class="report-footer"><span>AR7 Elétrica</span><span>Evidências fotográficas · ${safe(title)}</span></div></section>`).join('');
  };

  const reportDocumentCommercialBeforeV13=reportDocumentV5;
  reportDocumentV5=function(order){
    const template=document.createElement('template');template.innerHTML=reportDocumentCommercialBeforeV13(order).trim();
    template.content.querySelectorAll('.report-budget-block-v11,.report-approval-block-v10').forEach(node=>node.remove());
    const documentRoot=template.content.querySelector('.report-document');if(documentRoot)documentRoot.classList.add('report-document-v13','technical-report-only-v13');
    template.content.querySelectorAll('.report-page').forEach((page,index)=>page.dataset.pageNumber=String(index+1));
    return template.innerHTML;
  };

  function portalClientV13(clientId=''){const client=resolvePortalClientV8(clientId);if(client)setPortalSessionIdV8(client.id);return client;}
  function portalOrdersV13(client){return db.orders.filter(order=>order.clientId===client.id).sort((a,b)=>String(b.availableSince||b.createdAt||'').localeCompare(String(a.availableSince||a.createdAt||'')));}
  function portalEquipmentV13(client){return db.equipment.filter(eq=>eq.clientId===client.id);}
  function portalMenuItemsV13(clientId){return [
    [`portal/${clientId}`,'Dashboard','home','portal'],
    [`portal-equipment/${clientId}`,'Meus Equipamentos','motor','portal-equipment'],
    [`portal-orders/${clientId}`,'Ordens de Serviço','clipboard','portal-orders'],
    [`portal-reports/${clientId}`,'Relatórios','chart','portal-reports'],
    [`portal-approvals/${clientId}`,'Aprovações','check','portal-approvals'],
    [`portal-history/${clientId}`,'Histórico','clock','portal-history'],
    [`portal-photos/${clientId}`,'Fotos','camera','portal-photos']
  ];}

  const shellAdminBeforeV13=shell;
  shell=function(content,route,portal=false,portalClientId=''){
    if(!portal)return shellAdminBeforeV13(content,route,false,portalClientId).replace(/<small>v12<\/small>/g,'<small>v13</small>');
    const client=portalClientV13(portalClientId);if(!client)return shellAdminBeforeV13(content,route,false,portalClientId);
    const nav=portalMenuItemsV13(client.id).map(([href,label,ico,routeName])=>`<a href="#${href}" class="${route===routeName?'active':''}">${icon(ico)}<span>${safe(label)}</span></a>`).join('');
    return `<div class="app-shell portal-shell"><aside class="sidebar" id="sidebar"><a class="brand" href="#portal/${client.id}" aria-label="Voltar ao dashboard da empresa" title="Voltar ao dashboard da empresa"><span class="brand-logo-wrap"><img src="./assets/ar7-logo.png" alt="AR7 Elétrica"></span><small class="brand-subtitle">Portal exclusivo da empresa</small></a><nav class="nav">${nav}</nav><div class="sidebar-foot"><div class="machine">🏭</div><div><strong>${safe(client.name)}</strong><small>Acesso exclusivo</small><div class="sidebar-live"><span class="status-dot"></span>Dados da própria empresa</div></div></div></aside><div class="sidebar-overlay" id="sidebar-overlay" hidden></div><main class="main"><header class="topbar"><button class="menu-btn" data-action="toggle-menu" aria-label="Abrir menu">${icon('menu',24)}</button><div class="live-sync-indicator"><span></span>Acompanhamento atualizado</div><div class="top-actions"><button class="top-icon" aria-label="Notificações">${icon('bell')}<span>5</span></button><button class="top-icon" aria-label="Ajuda">${icon('help')}</button></div></header>${content}</main></div>`;
  };

  function portalApprovalCardsV13(client,orders){
    return orders.filter(order=>order.stage==='aprovacao'&&ensureApprovalV10(order).status===APPROVAL_STATUS_V10.WAITING).map(order=>{const approval=ensureApprovalV10(order),budget=ensureBudgetV11(order),eq=getEquipment(order.equipmentId);return `<article class="portal-approval-card-v10"><div class="portal-approval-card-head"><div><span>${safe(budget.proposalCode)} · OS #${safe(order.number)}</span><h3>${safe(equipmentDescription(eq))}</h3></div>${badge('Aguardando sua decisão','amber')}</div><div class="portal-approval-body-v10"><div><small>Escopo proposto</small><p>${safe(budget.technicalScope||approval.scope)}</p></div><div class="portal-approval-commercial-v10"><div><small>Investimento</small><strong>${moneyV11(budgetTotalsV11(order).total)}</strong></div><div><small>Validade</small><strong>${formatDate(budget.validUntil)}</strong></div></div><details><summary>Condições comerciais</summary><p>Pagamento: ${safe(budget.paymentTerms)}. Prazo: ${safe(budget.executionDays)} dias úteis. Garantia: ${safe(budget.warranty)}.</p></details></div><div class="portal-approval-actions-v10"><button class="btn btn-light" data-action="portal-adjustment-v10" data-id="${order.id}">Solicitar ajuste</button><button class="btn btn-success" data-action="portal-approval-v10" data-id="${order.id}">${icon('check')} Aprovar orçamento</button></div></article>`;}).join('');
  }
  function portalDashboardV13(client){
    const orders=portalOrdersV13(client),equipment=portalEquipmentV13(client),pending=orders.filter(o=>o.stage==='aprovacao'&&!approvalGrantedV10(o)),reports=orders.filter(o=>o.report?.sent),ready=orders.filter(o=>o.stage==='concluida'),open=orders.filter(o=>o.stage!=='concluida');
    const recent=orders.slice(0,6);
    return shell(`<div class="page portal-page">${pageHead('Dashboard da empresa',`${safe(client.name)} acompanha exclusivamente os próprios equipamentos, aprovações, fotos e relatórios.`,`<span class="live-pill"><i></i>Dados atualizados</span>`)}<section class="portal-isolation-notice">${icon('check',18)}<div><strong>Ambiente exclusivo de ${safe(client.name)}</strong><span>Cada opção do menu abre os dados correspondentes desta empresa.</span></div></section><div class="grid kpi-grid portal-kpis">${kpi(open.length,'Em andamento','tools','bg-blue',`#portal-orders/${client.id}`,'Abrir ordens')}${kpi(pending.length,'Aprovações pendentes','clock','bg-amber',`#portal-approvals/${client.id}`,'Analisar')}${kpi(equipment.length,'Equipamentos','motor','bg-purple',`#portal-equipment/${client.id}`,'Acompanhar')}${kpi(ready.length,'Prontos / concluídos','check','bg-green',`#portal-orders/${client.id}`,'Ver concluídos')}${kpi(reports.length,'Relatórios técnicos','file','bg-blue',`#portal-reports/${client.id}`,'Abrir relatórios')}</div><div class="grid portal-bottom-layout"><section class="card"><div class="card-head"><div><h2>Atualizações recentes</h2><p>Movimentações mais recentes das ordens da empresa.</p></div><a class="table-link" href="#portal-history/${client.id}">Histórico completo</a></div><div class="card-body timeline">${recent.map(order=>`<div class="timeline-item"><strong>${safe(getEquipment(order.equipmentId)?.tag||'Equipamento')} · ${safe(stageLabel(order.stage))}</strong><p>OS #${safe(order.number)} · ${formatDateTime(order.availableSince||order.createdAt||order.entryDate)}</p><p>${safe(order.records?.tests||order.records?.assembly||order.records?.diagnosis||order.defect||'Atualização operacional registrada.')}</p></div>`).join('')||'<div class="empty">Nenhuma movimentação registrada.</div>'}</div></section><aside class="stack"><section class="card"><div class="card-head"><h2>Ações necessárias</h2></div><div class="card-body alert-list">${pending.map(order=>`<a class="alert-item alert-link" href="#portal-approvals/${client.id}"><div class="alert-icon tone-amber">${icon('clock')}</div><div><strong>OS #${safe(order.number)}</strong><p>Orçamento aguardando aprovação da empresa.</p></div>${icon('arrow',16)}</a>`).join('')||'<div class="empty">Nenhuma ação pendente.</div>'}</div></section><section class="card"><div class="card-head"><h2>Acesso rápido</h2></div><div class="card-body portal-shortcuts-v13"><a href="#portal-equipment/${client.id}">${icon('motor')} Equipamentos</a><a href="#portal-photos/${client.id}">${icon('camera')} Fotos</a><a href="#portal-reports/${client.id}">${icon('file')} Relatórios</a></div></section></aside></div></div>`,'portal',true,client.id);
  }
  function portalEquipmentViewV13(clientId){const client=portalClientV13(clientId);if(!client)return notFoundView();const orders=portalOrdersV13(client),cards=portalEquipmentV13(client).map(eq=>equipmentProgressCardV7(eq,latestOrderForEquipmentV7(eq.id,orders),true)).join('');return shell(`<div class="page portal-page">${pageHead('Meus equipamentos','Acompanhe individualmente a etapa, o prazo e a situação de cada ativo.')}<section class="card"><div class="card-head"><div><h2>Equipamentos cadastrados</h2><p>${portalEquipmentV13(client).length} equipamento(s) vinculado(s) exclusivamente à empresa.</p></div></div><div class="card-body client-equipment-progress portal-progress-grid">${cards||'<div class="empty">Nenhum equipamento cadastrado.</div>'}</div></section></div>`,'portal-equipment',true,client.id);}
  function portalOrdersViewV13(clientId){const client=portalClientV13(clientId);if(!client)return notFoundView();const orders=portalOrdersV13(client),rows=orders.map(order=>{const eq=getEquipment(order.equipmentId);return `<tr><td><strong>OS #${safe(order.number)}</strong></td><td>${safe(eq?.tag||'—')}<br><small>${safe(equipmentDescription(eq))}</small></td><td>${badge(stageLabel(order.stage),stageTone(order.stage))}</td><td>${formatDate(order.entryDate)}</td><td>${formatDate(order.dueDate)}</td><td>${order.stage==='aprovacao'?`<a class="btn btn-primary btn-sm" href="#portal-approvals/${client.id}">Analisar orçamento</a>`:order.report?.sent?`<button class="btn btn-light btn-sm" data-action="portal-report" data-id="${order.id}">Relatório técnico</button>`:'Acompanhamento em tempo real'}</td></tr>`;}).join('');return shell(`<div class="page portal-page">${pageHead('Ordens de serviço','Situação atual e prazos de todas as ordens da empresa.')}<section class="card"><div class="table-wrap"><table class="table"><thead><tr><th>OS</th><th>Equipamento</th><th>Etapa</th><th>Entrada</th><th>Previsão</th><th>Ação</th></tr></thead><tbody>${rows||'<tr><td colspan="6"><div class="empty">Nenhuma ordem registrada.</div></td></tr>'}</tbody></table></div></section></div>`,'portal-orders',true,client.id);}
  function portalReportsViewV13(clientId){const client=portalClientV13(clientId);if(!client)return notFoundView();const orders=portalOrdersV13(client).filter(order=>order.report?.sent);const cards=orders.map(order=>{const eq=getEquipment(order.equipmentId);return `<article class="portal-report-card-v13"><div class="alert-icon tone-blue">${icon('file')}</div><div><strong>Relatório técnico · OS #${safe(order.number)}</strong><p>${safe(eq?.tag||'—')} · ${safe(equipmentDescription(eq))}</p><span>Emitido em ${formatDateTime(order.report.sentAt)}</span></div><button class="btn btn-primary btn-sm" data-action="portal-report" data-id="${order.id}">Abrir relatório</button></article>`;}).join('');return shell(`<div class="page portal-page">${pageHead('Relatórios técnicos','Documentos técnicos sem valores comerciais, contendo serviços, medições, fotos e assinaturas.')}<div class="portal-report-list-v13">${cards||'<div class="empty">Nenhum relatório técnico disponível.</div>'}</div></div>`,'portal-reports',true,client.id);}
  function portalApprovalsViewV13(clientId){const client=portalClientV13(clientId);if(!client)return notFoundView();const orders=portalOrdersV13(client),cards=portalApprovalCardsV13(client,orders);return shell(`<div class="page portal-page">${pageHead('Aprovações','Somente esta área pode liberar o orçamento para compra ou montagem.')}<section class="portal-isolation-notice portal-approval-notice-v13">${icon('alert',18)}<div><strong>A aprovação é registrada em nome de ${safe(client.name)}</strong><span>A AR7 não consegue substituir esta confirmação pela área administrativa.</span></div></section><div class="portal-approval-grid-v10">${cards||'<div class="empty">Nenhum orçamento aguardando decisão.</div>'}</div></div>`,'portal-approvals',true,client.id);}
  function portalHistoryViewV13(clientId){const client=portalClientV13(clientId);if(!client)return notFoundView();const orders=portalOrdersV13(client);const records=orders.flatMap(order=>{const eq=getEquipment(order.equipmentId);const items=(order.handoffs||[]).map(h=>({at:h.at,title:`OS #${order.number} · ${stageLabel(h.fromStage)} → ${stageLabel(h.toStage)}`,text:`${h.fromTeam} liberou para ${h.toTeam}. ${h.note||''}`,eq}));items.push({at:order.availableSince||order.createdAt||order.entryDate,title:`OS #${order.number} · ${stageLabel(order.stage)}`,text:order.records?.tests||order.records?.assembly||order.records?.diagnosis||order.defect||'Atualização registrada.',eq});return items;}).sort((a,b)=>String(b.at).localeCompare(String(a.at)));return shell(`<div class="page portal-page">${pageHead('Histórico','Linha do tempo das etapas e movimentações dos equipamentos da empresa.')}<section class="card"><div class="card-body timeline portal-history-v13">${records.map(item=>`<div class="timeline-item"><strong>${safe(item.eq?.tag||'Equipamento')} · ${safe(item.title)}</strong><p>${formatDateTime(item.at)}</p><p>${safe(item.text)}</p></div>`).join('')||'<div class="empty">Nenhum histórico disponível.</div>'}</div></section></div>`,'portal-history',true,client.id);}
  function portalPhotosViewV13(clientId){const client=portalClientV13(clientId);if(!client)return notFoundView();const groups={before:'Recebimento',during:'Diagnóstico / desmontagem',assembly:'Montagem',after:'Finalização'};const orders=portalOrdersV13(client);const photos=orders.flatMap(order=>Object.entries(groups).flatMap(([group,label])=>(order.photos?.[group]||[]).map((photo,index)=>({photo,group,label,index,order,eq:getEquipment(order.equipmentId)}))));const cards=photos.map(item=>{const p=normalizePhotoV5(item.photo),obs=photoObservationV13(item.photo);return `<article class="photo-card-v5 photo-card-v13 portal-photo-card-v13">${annotatedPhoto(p,'','Evidência fotográfica')}<div class="photo-metadata-v13"><strong>${safe(p.caption||`${item.label} · foto ${item.index+1}`)}</strong><span>OS #${safe(item.order.number)} · ${safe(item.eq?.tag||'—')} · ${safe(item.label)}</span><p>${obs?safe(obs):'Sem observação técnica complementar.'}</p></div></article>`;}).join('');return shell(`<div class="page portal-page">${pageHead('Fotos','Evidências liberadas no acompanhamento técnico da empresa.')}<div class="photo-grid photo-grid-v5 portal-photos-grid-v13">${cards||'<div class="empty">Nenhuma foto disponível.</div>'}</div></div>`,'portal-photos',true,client.id);}

  render=function(options={}){
    const {route,param}=parseRoute(),routeKey=`${route}/${param||''}`,resetScroll=options?.resetScroll===true||Boolean(renderedRouteKeyV7&&renderedRouteKeyV7!==routeKey),state=resetScroll?null:captureUIStateV7();
    const views={dashboard:dashboardView,orders:()=>ordersView(param),clients:clientsView,client:()=>clientDetailView(param),equipment:equipmentView,parts:()=>partsView(param),budgets:budgetsViewV11,proposal:()=>proposalViewV11(param),workshop:workshopView,reports:()=>reportsView(param),portal:()=>portalDashboardV13(portalClientV13(param)), 'portal-equipment':()=>portalEquipmentViewV13(param),'portal-orders':()=>portalOrdersViewV13(param),'portal-reports':()=>portalReportsViewV13(param),'portal-approvals':()=>portalApprovalsViewV13(param),'portal-history':()=>portalHistoryViewV13(param),'portal-photos':()=>portalPhotosViewV13(param),'portal-report':()=>portalReportViewV8(param),settings:settingsView,order:()=>orderDetailView(param)};
    try{document.getElementById('app').innerHTML=(views[route]||notFoundView)();renderedRouteKeyV7=routeKey;requestAnimationFrame(()=>{enhancePageV12();if(resetScroll)window.scrollTo(0,0);else restoreUIStateV7(state);});}catch(error){console.error('Falha ao renderizar',error);document.getElementById('app').innerHTML=`<div class="fatal-error"><h1>Não foi possível abrir esta tela</h1><p>${safe(error.message)}</p><a href="#dashboard">Voltar ao dashboard</a></div>`;}
  };



  /* =========================
     AR7 V14 — exclusão segura de ordens de serviço
     ========================= */
  function ensureDeletedOrdersV14(target=db){
    if(!target) return [];
    target.deletedOrders=Array.isArray(target.deletedOrders)?target.deletedOrders:[];
    return target.deletedOrders;
  }
  const initializedTrashV14=Array.isArray(db.deletedOrders);
  ensureDeletedOrdersV14();
  if(!initializedTrashV14) saveDB();

  const normalizeAfterLoadBeforeV14=normalizeAfterLoadV5;
  normalizeAfterLoadV5=function(parsed){
    const normalized=normalizeAfterLoadBeforeV14(parsed);
    ensureDeletedOrdersV14(normalized);
    return normalized;
  };

  const nextOrderNumberBeforeV14=nextOrderNumber;
  nextOrderNumber=function(){
    const year=new Date().getFullYear();
    const all=[...(db.orders||[]),...ensureDeletedOrdersV14()];
    const sequence=all.reduce((max,order)=>{
      const match=String(order.number||'').match(new RegExp(`^${year}-(\\d{4})$`));
      return match?Math.max(max,Number(match[1])):max;
    },0)+1;
    return `${year}-${String(sequence).padStart(4,'0')}`;
  };

  const navItemsBeforeV14=navItems;
  navItems=function(portal=false){
    const items=navItemsBeforeV14(portal);
    if(portal) return items;
    if(!items.some(item=>item[0]==='trash-orders')){
      const index=items.findIndex(item=>item[0]==='orders');
      items.splice(Math.max(0,index+1),0,['trash-orders','Lixeira de OS','trash']);
    }
    return items;
  };

  function deletedOrderClientV14(order){return getClient(order.clientId);}
  function deletedOrderEquipmentV14(order){return getEquipment(order.equipmentId);}
  function deletedAtV14(order){return order.deletedMeta?.deletedAt||order.deletedAt||'';}
  function deletionReasonV14(order){return order.deletedMeta?.reason||'Motivo não informado';}

  function ordersViewV14(initialFilter=''){
    const selected=initialFilter||'';
    const rows=(db.orders||[]).map(order=>{
      const client=getClient(order.clientId),eq=getEquipment(order.equipmentId);
      const visible=!selected||(selected==='open'?order.stage!=='concluida':order.stage===selected);
      return `<tr data-stage="${safe(order.stage)}" style="${visible?'':'display:none'}"><td><a class="table-link" href="#order/${order.id}">#${safe(order.number)}</a></td><td>${safe(client?.name||'—')}</td><td><strong>${safe(eq?.tag||'—')}</strong><br><span class="muted-small">${safe(equipmentDescription(eq))}</span></td><td>${badge(stageLabel(order.stage),stageTone(order.stage))}</td><td>${formatDate(order.entryDate)}</td><td>${formatDate(order.dueDate)}</td><td>${safe(order.technician||'A definir')}</td><td><div class="row-actions"><button class="btn btn-light btn-sm" data-action="open-order" data-id="${order.id}">${icon('edit',14)} Abrir</button><button class="btn btn-light btn-sm" data-action="open-report" data-id="${order.id}">${icon('file',14)} Relatório</button><button class="icon-danger" data-action="delete-order-v14" data-id="${order.id}" aria-label="Excluir OS ${safe(order.number)}" title="Mover OS para a lixeira">${icon('trash',14)}</button></div></td></tr>`;
    }).join('');
    const visibleCount=(db.orders||[]).filter(order=>!selected||(selected==='open'?order.stage!=='concluida':order.stage===selected)).length;
    return shell(`<div class="page">${pageHead('Ordens de Serviço',`Filtro atual: ${safe(orderFilterLabelV7(selected))}.`,`<a class="btn btn-light" href="#trash-orders">${icon('trash',16)} Lixeira (${ensureDeletedOrdersV14().length})</a><button class="btn btn-primary" data-action="new-order">${icon('plus')} Nova OS</button>`)}<section class="card"><div class="card-head"><div class="filters"><div class="search"><input class="input" id="order-search" placeholder="Pesquisar por OS, cliente ou TAG"></div><select class="select" id="order-stage-filter"><option value="" ${selected===''?'selected':''}>Todas as etapas</option><option value="open" ${selected==='open'?'selected':''}>Todas as OS abertas</option>${STAGES.map(stage=>`<option value="${stage.id}" ${selected===stage.id?'selected':''}>${safe(stage.label)}</option>`).join('')}</select></div><span id="orders-visible-count">${visibleCount} registro(s)</span></div><div class="table-wrap" data-preserve-scroll="orders-table"><table class="table" id="orders-table"><thead><tr><th>OS</th><th>Cliente</th><th>Equipamento</th><th>Etapa</th><th>Entrada</th><th>Prazo</th><th>Técnico</th><th>Ações</th></tr></thead><tbody>${rows||'<tr><td colspan="8"><div class="empty">Nenhuma ordem de serviço ativa.</div></td></tr>'}</tbody></table></div></section></div>`,'orders');
  }
  ordersView=ordersViewV14;

  const orderDetailViewBeforeV14=orderDetailView;
  orderDetailView=function(orderId){
    const order=getOrder(orderId);
    if(!order) return notFoundView();
    let html=orderDetailViewBeforeV14(orderId);
    const reportButton=`<button class="btn btn-light" data-action="open-report" data-id="${order.id}">${icon('file')} Relatório</button>`;
    const actions=`${reportButton}<button class="btn btn-danger" data-action="delete-order-v14" data-id="${order.id}">${icon('trash',16)} Excluir OS</button>`;
    if(html.includes(reportButton)) html=html.replace(reportButton,actions);
    return html;
  };

  function trashOrdersViewV14(){
    const deleted=ensureDeletedOrdersV14().slice().sort((a,b)=>String(deletedAtV14(b)).localeCompare(String(deletedAtV14(a))));
    const rows=deleted.map(order=>{
      const client=deletedOrderClientV14(order),eq=deletedOrderEquipmentV14(order);
      return `<tr><td><strong>#${safe(order.number)}</strong><br><small>${safe(stageLabel(order.deletedMeta?.previousStage||order.stage))}</small></td><td>${safe(client?.name||'Cliente preservado')}</td><td><strong>${safe(eq?.tag||'—')}</strong><br><span class="muted-small">${safe(equipmentDescription(eq))}</span></td><td>${formatDateTime(deletedAtV14(order))}</td><td><div class="deleted-reason-v14">${safe(deletionReasonV14(order))}</div><small>${safe(order.deletedMeta?.deletedBy||'Administrador AR7')}</small></td><td><div class="row-actions"><button class="btn btn-primary btn-sm" data-action="restore-order-v14" data-id="${order.id}">${icon('arrow',14)} Restaurar</button><button class="btn btn-danger btn-sm" data-action="permanent-delete-order-v14" data-id="${order.id}">${icon('trash',14)} Apagar definitivamente</button></div></td></tr>`;
    }).join('');
    return shell(`<div class="page trash-page-v14">${pageHead('Lixeira de Ordens de Serviço','As OS excluídas deixam de aparecer nos dashboards, no portal do cliente e nas filas operacionais. Cliente e equipamento não são apagados.',`<a class="btn btn-light" href="#orders">${icon('arrow',15)} Voltar para Ordens de Serviço</a>`)}<section class="trash-guidance-v14">${icon('alert',22)}<div><strong>Exclusão segura</strong><p>Primeiro a OS é movida para a lixeira e pode ser restaurada. A exclusão definitiva exige uma segunda confirmação e não pode ser desfeita.</p></div></section><section class="card"><div class="card-head"><div><h2>OS na lixeira</h2><p>${deleted.length} registro(s) excluído(s).</p></div></div><div class="table-wrap"><table class="table"><thead><tr><th>OS / etapa anterior</th><th>Cliente</th><th>Equipamento</th><th>Excluída em</th><th>Motivo / responsável</th><th>Ações</th></tr></thead><tbody>${rows||'<tr><td colspan="6"><div class="empty"><strong>A lixeira está vazia</strong><span>Nenhuma ordem de serviço foi excluída.</span></div></td></tr>'}</tbody></table></div></section></div>`,'trash-orders');
  }

  function openDeleteOrderModalV14(orderId){
    const order=getOrder(orderId);if(!order)return toast('OS não encontrada.','error');
    const client=getClient(order.clientId),eq=getEquipment(order.equipmentId);
    openModal(`Excluir OS ${order.number}`,`<form id="delete-order-form-v14" class="form-grid"><input type="hidden" name="orderId" value="${safe(order.id)}"><section class="delete-warning-v14 span-2">${icon('alert',28)}<div><strong>A OS será movida para a lixeira</strong><p>Ela deixará de aparecer nos dashboards, nas filas, nos relatórios pendentes e no portal do cliente. O cliente e o equipamento continuarão cadastrados.</p></div></section><div class="delete-order-summary-v14 span-2"><div><span>Cliente</span><strong>${safe(client?.name||'—')}</strong></div><div><span>Equipamento</span><strong>${safe(eq?.tag||'—')} · ${safe(equipmentDescription(eq))}</strong></div><div><span>Etapa atual</span><strong>${safe(stageLabel(order.stage))}</strong></div></div><div class="form-group span-2"><label>Motivo da exclusão *</label><textarea class="textarea" name="reason" required minlength="8" placeholder="Ex.: OS criada em duplicidade ou equipamento cadastrado incorretamente."></textarea><small>O motivo ficará registrado na lixeira.</small></div><div class="form-group span-2"><label>Digite o número da OS para confirmar *</label><input class="input" name="confirmation" required autocomplete="off" placeholder="${safe(order.number)}"><small>Digite exatamente: <strong>${safe(order.number)}</strong></small></div></form>`,`<button class="btn btn-light" data-action="close-modal">Cancelar</button><button class="btn btn-danger" data-action="confirm-delete-order-v14">${icon('trash',16)} Mover para a lixeira</button>`);
  }

  function confirmDeleteOrderV14(){
    const form=document.getElementById('delete-order-form-v14');if(!form||!form.reportValidity())return;
    const data=Object.fromEntries(new FormData(form)),order=getOrder(data.orderId);if(!order)return toast('A OS já não está disponível.','error');
    if(String(data.confirmation||'').trim()!==String(order.number)){toast('O número digitado não corresponde à OS.','error');return;}
    const reason=String(data.reason||'').trim();if(reason.length<8){toast('Informe um motivo mais claro para a exclusão.','error');return;}
    const index=db.orders.findIndex(item=>item.id===order.id);if(index<0)return;
    const now=new Date().toISOString();
    order.deletionHistory=Array.isArray(order.deletionHistory)?order.deletionHistory:[];
    order.deletionHistory.push({action:'Movida para a lixeira',at:now,by:'Administrador AR7',reason,stage:order.stage});
    order.deletedMeta={deletedAt:now,deletedBy:'Administrador AR7',reason,previousStage:order.stage,originalIndex:index};
    db.orders.splice(index,1);ensureDeletedOrdersV14().unshift(order);
    addActivity(`OS ${order.number} movida para a lixeira. Motivo: ${reason}`);
    saveDB();closeModal();location.hash='#orders';render({resetScroll:true});toast(`OS ${order.number} movida para a lixeira.`);
  }

  function restoreOrderV14(orderId){
    const deleted=ensureDeletedOrdersV14(),index=deleted.findIndex(item=>item.id===orderId);if(index<0)return toast('OS não encontrada na lixeira.','error');
    const order=deleted[index];
    if((db.orders||[]).some(item=>item.id===order.id||String(item.number)===String(order.number))){toast('Não foi possível restaurar: já existe uma OS ativa com o mesmo número.','error');return;}
    const restoredAt=new Date().toISOString(),previous=order.deletedMeta?.previousStage||order.stage||'entrada';
    order.deletionHistory=Array.isArray(order.deletionHistory)?order.deletionHistory:[];
    order.deletionHistory.push({action:'Restaurada da lixeira',at:restoredAt,by:'Administrador AR7',reason:order.deletedMeta?.reason||''});
    order.stage=previous;order.availableSince=restoredAt;order.restoredAt=restoredAt;delete order.deletedMeta;
    deleted.splice(index,1);db.orders.unshift(order);addActivity(`OS ${order.number} restaurada da lixeira para ${stageLabel(order.stage)}.`);saveDB();render();toast(`OS ${order.number} restaurada.`);
  }

  function openPermanentDeleteModalV14(orderId){
    const order=ensureDeletedOrdersV14().find(item=>item.id===orderId);if(!order)return toast('OS não encontrada na lixeira.','error');
    openModal(`Apagar definitivamente a OS ${order.number}`,`<form id="permanent-delete-order-form-v14" class="form-grid"><input type="hidden" name="orderId" value="${safe(order.id)}"><section class="permanent-delete-warning-v14 span-2">${icon('alert',30)}<div><strong>Esta ação não pode ser desfeita</strong><p>Todos os registros, peças, fotos, medições, assinaturas, proposta e relatório vinculados à OS serão removidos deste navegador. Cliente e equipamento permanecerão cadastrados.</p></div></section><div class="form-group span-2"><label>Digite a frase abaixo para confirmar *</label><input class="input" name="confirmation" required autocomplete="off" placeholder="EXCLUIR OS ${safe(order.number)}"><small>Digite exatamente: <strong>EXCLUIR OS ${safe(order.number)}</strong></small></div></form>`,`<button class="btn btn-light" data-action="close-modal">Cancelar</button><button class="btn btn-danger" data-action="confirm-permanent-delete-order-v14">${icon('trash',16)} Apagar definitivamente</button>`);
  }

  function confirmPermanentDeleteV14(){
    const form=document.getElementById('permanent-delete-order-form-v14');if(!form||!form.reportValidity())return;
    const data=Object.fromEntries(new FormData(form)),deleted=ensureDeletedOrdersV14(),index=deleted.findIndex(item=>item.id===data.orderId);if(index<0)return toast('OS não encontrada na lixeira.','error');
    const order=deleted[index],expected=`EXCLUIR OS ${order.number}`;
    if(String(data.confirmation||'').trim()!==expected){toast('A frase de confirmação está incorreta.','error');return;}
    deleted.splice(index,1);addActivity(`OS ${order.number} apagada definitivamente da lixeira.`);saveDB();closeModal();render();toast(`OS ${order.number} apagada definitivamente.`);
  }

  function handleV14OrderDeletion(event){
    const target=event.target.closest('[data-action]');if(!target)return;
    const action=target.dataset.action;
    if(!['delete-order-v14','confirm-delete-order-v14','restore-order-v14','permanent-delete-order-v14','confirm-permanent-delete-order-v14'].includes(action))return;
    event.preventDefault();event.stopImmediatePropagation();
    if(action==='delete-order-v14')openDeleteOrderModalV14(target.dataset.id);
    if(action==='confirm-delete-order-v14')confirmDeleteOrderV14();
    if(action==='restore-order-v14')restoreOrderV14(target.dataset.id);
    if(action==='permanent-delete-order-v14')openPermanentDeleteModalV14(target.dataset.id);
    if(action==='confirm-permanent-delete-order-v14')confirmPermanentDeleteV14();
  }

  const shellBeforeV14=shell;
  shell=function(content,route,portal=false,portalClientId=''){
    return shellBeforeV14(content,route,portal,portalClientId).replace(/<small>v13<\/small>/g,'<small>v14</small>');
  };

  render=function(options={}){
    ensureDeletedOrdersV14();
    const {route,param}=parseRoute(),routeKey=`${route}/${param||''}`,resetScroll=options?.resetScroll===true||Boolean(renderedRouteKeyV7&&renderedRouteKeyV7!==routeKey),state=resetScroll?null:captureUIStateV7();
    const views={dashboard:dashboardView,orders:()=>ordersView(param),'trash-orders':trashOrdersViewV14,clients:clientsView,client:()=>clientDetailView(param),equipment:equipmentView,parts:()=>partsView(param),budgets:budgetsViewV11,proposal:()=>proposalViewV11(param),workshop:workshopView,reports:()=>reportsView(param),portal:()=>portalDashboardV13(portalClientV13(param)),'portal-equipment':()=>portalEquipmentViewV13(param),'portal-orders':()=>portalOrdersViewV13(param),'portal-reports':()=>portalReportsViewV13(param),'portal-approvals':()=>portalApprovalsViewV13(param),'portal-history':()=>portalHistoryViewV13(param),'portal-photos':()=>portalPhotosViewV13(param),'portal-report':()=>portalReportViewV8(param),settings:settingsView,order:()=>orderDetailView(param)};
    try{document.getElementById('app').innerHTML=(views[route]||notFoundView)();renderedRouteKeyV7=routeKey;requestAnimationFrame(()=>{enhancePageV12();if(resetScroll)window.scrollTo(0,0);else restoreUIStateV7(state);});}catch(error){console.error('Falha ao renderizar',error);document.getElementById('app').innerHTML=`<div class="fatal-error"><h1>Não foi possível abrir esta tela</h1><p>${safe(error.message)}</p><a href="#dashboard">Voltar ao dashboard</a></div>`;}
  };

  document.addEventListener('click',handleV14OrderDeletion,true);



  /* ==============================================================
     AR7 V16 — troca real de empresa no portal para testes
     ============================================================== */
  const PORTAL_TEST_COMPANY_KEY_V16='ar7-portal-test-company-v16';

  function ensurePortalDemoDataV16(){
    const demo=seedDB();
    let changed=false;
    const clientMap=new Map();
    db.clients=Array.isArray(db.clients)?db.clients:[];
    db.equipment=Array.isArray(db.equipment)?db.equipment:[];
    db.orders=Array.isArray(db.orders)?db.orders:[];
    for(const source of demo.clients||[]){
      let target=db.clients.find(c=>String(c.name||'').trim().toLowerCase()===String(source.name||'').trim().toLowerCase());
      if(!target){
        let id=source.id;
        if(db.clients.some(c=>c.id===id)) id=`demo-${source.id}`;
        target={...source,id};
        db.clients.push(target);changed=true;
      }
      clientMap.set(source.id,target.id);
    }
    const equipmentMap=new Map();
    for(const source of demo.equipment||[]){
      const mappedClientId=clientMap.get(source.clientId)||source.clientId;
      let target=db.equipment.find(eq=>eq.clientId===mappedClientId&&String(eq.tag||'').trim().toLowerCase()===String(source.tag||'').trim().toLowerCase());
      if(!target){
        let id=source.id;
        if(db.equipment.some(eq=>eq.id===id)) id=`demo-${source.id}`;
        target={...source,id,clientId:mappedClientId};
        db.equipment.push(target);changed=true;
      }
      equipmentMap.set(source.id,target.id);
    }
    for(const source of demo.orders||[]){
      const mappedClientId=clientMap.get(source.clientId)||source.clientId;
      const mappedEquipmentId=equipmentMap.get(source.equipmentId)||source.equipmentId;
      const exists=db.orders.some(order=>String(order.number)===String(source.number));
      if(!exists){
        let id=source.id;
        if(db.orders.some(order=>order.id===id)) id=`demo-${source.id}`;
        db.orders.push({...source,id,clientId:mappedClientId,equipmentId:mappedEquipmentId});changed=true;
      }
    }
    if(changed){db.version=16;saveDB();}
  }
  ensurePortalDemoDataV16();

  function portalCompanyOptionsV16(selectedId=''){
    return (db.clients||[]).slice().sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'pt-BR')).map(client=>`<option value="${safe(client.id)}" ${client.id===selectedId?'selected':''}>${safe(client.name)}${client.active===false?' (inativa)':''}</option>`).join('');
  }

  function portalRouteForCompanyV16(route,clientId){
    const routeMap={portal:'portal','portal-equipment':'portal-equipment','portal-orders':'portal-orders','portal-reports':'portal-reports','portal-approvals':'portal-approvals','portal-history':'portal-history','portal-photos':'portal-photos'};
    return `#${routeMap[route]||'portal'}/${clientId}`;
  }

  const resolvePortalClientBeforeV16=resolvePortalClientV8;
  resolvePortalClientV8=function(requestedId=''){
    const requested=getClient(requestedId);
    if(requested){setPortalSessionIdV8(requested.id);return requested;}
    return resolvePortalClientBeforeV16(requestedId);
  };

  function switchPortalCompanyV16(clientId){
    const client=getClient(clientId);
    if(!client){toast('Empresa não encontrada no banco de dados.','error');return;}
    setPortalSessionIdV8(client.id);
    try{sessionStorage.setItem(PORTAL_TEST_COMPANY_KEY_V16,client.id);}catch{}
    const {route}=parseRoute();
    const destination=portalRouteForCompanyV16(route,client.id);
    if(location.hash===destination)render({resetScroll:true});else location.hash=destination;
    toast(`Portal alterado para ${client.name}.`);
  }

  const shellBeforeV16=shell;
  shell=function(content,route,portal=false,portalClientId=''){
    let html=shellBeforeV16(content,route,portal,portalClientId).replace(/<small>v15<\/small>/g,'<small>v16</small>');
    if(!portal)return html;
    const client=getClient(portalClientId)||portalClientV13(portalClientId)||resolvePortalClientV8(portalClientId);
    if(!client)return html;
    const bar=`<section class="portal-company-testbar-v16" aria-label="Troca de empresa para testes"><div class="portal-company-testbar-copy-v16"><span class="portal-test-badge-v16">MODO TESTE</span><div><strong>Empresa visualizada no portal</strong><small>Selecione qualquer empresa cadastrada para validar equipamentos, OS, aprovações, histórico, fotos e relatórios.</small></div></div><div class="portal-company-testbar-actions-v16"><select class="input portal-company-select-v16" id="portal-company-switch-page-v16" aria-label="Selecionar empresa do portal">${portalCompanyOptionsV16(client.id)}</select><a class="btn btn-light" href="#clients" title="Voltar à administração da AR7">${icon('arrow',15)} Área AR7</a></div></section>`;
    return html.replace('</header>',`</header>${bar}`);
  };

  function handlePortalCompanySwitchV16(event){
    const select=event.target.closest('#portal-company-switch-page-v16,.portal-company-select-v16');
    if(!select)return;
    event.preventDefault();event.stopImmediatePropagation();
    switchPortalCompanyV16(select.value);
  }
  document.addEventListener('change',handlePortalCompanySwitchV16,true);



  /* ==============================================================
     AR7 V17 — retorno do cliente: negativa/ajuste volta ao Orçamento
     ============================================================== */
  function ensureBudgetFeedbackV17(order){
    if(!Array.isArray(order.clientBudgetFeedbackV17))order.clientBudgetFeedbackV17=[];
    return order.clientBudgetFeedbackV17;
  }

  function latestBudgetFeedbackV17(order){
    const list=ensureBudgetFeedbackV17(order);
    return list.length?list[list.length-1]:null;
  }

  function clientReturnLabelV17(type){
    return type==='rejected'?'Orçamento negado pelo cliente':'Ajuste solicitado pelo cliente';
  }

  function registerClientBudgetReturnV17(order,type,reason,client){
    const approval=ensureApprovalV10(order),budget=ensureBudgetV11(order);
    const previousProposal=budget.proposalCode;
    const previousRevision=Number(budget.revision||1);
    const now=new Date().toISOString();
    const decidedBy=client?.contact||client?.name||'Responsável da empresa';
    const feedback={
      id:id('fb'),type,reason,at:now,by:decidedBy,clientId:client?.id||order.clientId,
      proposalCode:previousProposal,revision:previousRevision
    };
    ensureBudgetFeedbackV17(order).push(feedback);

    approval.status=type==='rejected'?APPROVAL_STATUS_V10.REJECTED:APPROVAL_STATUS_V10.ADJUSTMENT;
    approval.decidedAt=now;
    approval.decidedBy=decidedBy;
    approval.decisionChannel=PORTAL_APPROVAL_SOURCE_V13;
    approval.clientComment=reason;
    approval.portalApprovedByClientId='';
    approval.portalApprovalId='';

    budget.lastClientReturn={...feedback};
    budget.revision=previousRevision+1;
    budget.proposalCode=`PROP-${order.number}-R${String(budget.revision).padStart(2,'0')}`;
    budget.status=BUDGET_STATUS_V11.ADJUSTMENT;
    budget.internalApprovedAt='';
    budget.internalReviewer='';
    budget.internalReviewNote='';
    budget.sentAt='';

    order.stage='orcamento';
    order.availableSince=now;
    order.handoffs=order.handoffs||[];
    order.handoffs.push({
      fromStage:'aprovacao',toStage:'orcamento',fromTeam:'Cliente / Comercial',toTeam:'Comercial / Supervisor',at:now,
      note:`${clientReturnLabelV17(type)} na ${previousProposal}. Motivo: ${reason}`
    });
    addActivity(`OS ${order.number}: ${clientReturnLabelV17(type).toLowerCase()}. Motivo: ${reason} Nova revisão ${budget.proposalCode} aberta para correção.`);
    return feedback;
  }

  openPortalAdjustmentModalV10=function(orderId){
    const client=resolvePortalClientV8(),order=getOrder(orderId);
    if(!portalOrderAllowedV8(order,client,false))return toast('Esta proposta não pertence à empresa conectada.','error');
    const budget=ensureBudgetV11(order);
    openModal('Solicitar ajuste do orçamento',`<div class="stack"><div class="client-return-modal-v17">${icon('edit',22)}<div><strong>${safe(budget.proposalCode)} · OS #${safe(order.number)}</strong><p>Ao enviar, a proposta sai da aprovação e volta automaticamente para a AR7 corrigir o orçamento.</p></div></div><div class="form-group"><label>O que precisa ser alterado? *</label><textarea class="textarea stage-large-text" id="portal-adjustment-comment-v10" placeholder="Ex.: revisar prazo, retirar determinada peça, corrigir quantidade, alterar condição de pagamento..." autofocus></textarea><small>O motivo ficará registrado na OS e no histórico da proposta.</small></div></div>`,`<button class="btn btn-light" data-action="close-modal">Cancelar</button><button class="btn btn-primary" data-action="confirm-portal-adjustment-v10" data-id="${order.id}">Enviar e devolver para orçamento</button>`);
  };

  confirmPortalAdjustmentV10=function(orderId){
    const client=resolvePortalClientV8(),order=getOrder(orderId);
    if(!portalOrderAllowedV8(order,client,false))return toast('Esta proposta não pertence à empresa conectada.','error');
    const approval=ensureApprovalV10(order);
    if(order.stage!=='aprovacao'||approval.status!==APPROVAL_STATUS_V10.WAITING)return toast('Esta proposta não está aguardando decisão da empresa.','error');
    const reason=(document.getElementById('portal-adjustment-comment-v10')?.value||'').trim();
    if(reason.length<10)return toast('Descreva com mais detalhes o ajuste solicitado.','error');
    registerClientBudgetReturnV17(order,'adjustment',reason,client);
    saveDB();closeModal();render({resetScroll:true});
    toast('Solicitação registrada. A OS voltou para Orçamento para correção.');
  };

  function openPortalRejectModalV17(orderId){
    const client=resolvePortalClientV8(),order=getOrder(orderId);
    if(!portalOrderAllowedV8(order,client,false))return toast('Esta proposta não pertence à empresa conectada.','error');
    const budget=ensureBudgetV11(order);
    openModal('Negar orçamento',`<div class="stack"><div class="client-reject-warning-v17">${icon('alert',22)}<div><strong>Negar ${safe(budget.proposalCode)}?</strong><p>A compra e a montagem continuarão bloqueadas. A OS retornará automaticamente para Orçamento e a AR7 receberá o motivo para preparar uma nova revisão.</p></div></div><div class="form-group"><label>Motivo da negativa *</label><textarea class="textarea stage-large-text" id="portal-reject-reason-v17" placeholder="Ex.: valor acima do aprovado, prazo incompatível, escopo divergente, item não autorizado..." autofocus></textarea><small>Este motivo será exibido dentro da OS e no histórico comercial.</small></div></div>`,`<button class="btn btn-light" data-action="close-modal">Cancelar</button><button class="btn btn-danger" data-action="confirm-portal-reject-v17" data-id="${order.id}">Negar e devolver para orçamento</button>`);
  }

  function confirmPortalRejectV17(orderId){
    const client=resolvePortalClientV8(),order=getOrder(orderId);
    if(!portalOrderAllowedV8(order,client,false))return toast('Esta proposta não pertence à empresa conectada.','error');
    const approval=ensureApprovalV10(order);
    if(order.stage!=='aprovacao'||approval.status!==APPROVAL_STATUS_V10.WAITING)return toast('Esta proposta não está aguardando decisão da empresa.','error');
    const reason=(document.getElementById('portal-reject-reason-v17')?.value||'').trim();
    if(reason.length<10)return toast('Informe o motivo da negativa com pelo menos 10 caracteres.','error');
    registerClientBudgetReturnV17(order,'rejected',reason,client);
    saveDB();closeModal();render({resetScroll:true});
    toast('Orçamento negado. A OS voltou para Orçamento com o motivo registrado.','error');
  }

  const portalApprovalCardsBeforeV17=portalApprovalCardsV13;
  portalApprovalCardsV13=function(client,orders){
    return orders.filter(order=>order.stage==='aprovacao'&&ensureApprovalV10(order).status===APPROVAL_STATUS_V10.WAITING).map(order=>{
      const approval=ensureApprovalV10(order),budget=ensureBudgetV11(order),eq=getEquipment(order.equipmentId);
      return `<article class="portal-approval-card-v10 portal-approval-card-v17"><div class="portal-approval-card-head"><div><span>${safe(budget.proposalCode)} · OS #${safe(order.number)}</span><h3>${safe(equipmentDescription(eq))}</h3></div>${badge('Aguardando sua decisão','amber')}</div><div class="portal-approval-body-v10"><div><small>Escopo proposto</small><p>${safe(budget.technicalScope||approval.scope)}</p></div><div class="portal-approval-commercial-v10"><div><small>Investimento</small><strong>${moneyV11(budgetTotalsV11(order).total)}</strong></div><div><small>Validade</small><strong>${formatDate(budget.validUntil)}</strong></div></div><details><summary>Condições comerciais</summary><p>Pagamento: ${safe(budget.paymentTerms)}. Prazo: ${safe(budget.executionDays)} dias úteis. Garantia: ${safe(budget.warranty)}.</p></details></div><div class="portal-approval-actions-v10 portal-approval-actions-v17"><button class="btn btn-danger" data-action="portal-reject-v17" data-id="${order.id}">Negar orçamento</button><button class="btn btn-light" data-action="portal-adjustment-v10" data-id="${order.id}">Solicitar ajuste</button><button class="btn btn-success" data-action="portal-approval-v10" data-id="${order.id}">${icon('check')} Aprovar orçamento</button></div></article>`;
    }).join('');
  };

  const budgetWorkspaceBeforeV17=budgetWorkspaceV11;
  budgetWorkspaceV11=function(order){
    let html=budgetWorkspaceBeforeV17(order);
    const feedback=latestBudgetFeedbackV17(order);
    if(!feedback)return html;
    const history=ensureBudgetFeedbackV17(order).slice().reverse().map(item=>`<div class="client-feedback-history-item-v17"><div>${badge(item.type==='rejected'?'Negado':'Ajuste solicitado',item.type==='rejected'?'red':'amber')}<strong>${safe(item.proposalCode||'Proposta')}</strong></div><p>${safe(item.reason)}</p><small>${safe(item.by||'Cliente')} · ${formatDateTime(item.at)}</small></div>`).join('');
    const alert=`<section class="client-feedback-panel-v17 ${feedback.type==='rejected'?'rejected':'adjustment'}"><div class="client-feedback-panel-head-v17">${icon('alert',22)}<div><span>RETORNO DA EMPRESA CLIENTE</span><h3>${safe(clientReturnLabelV17(feedback.type))}</h3><p>Corrija o orçamento abaixo, envie para revisão interna novamente e depois gere uma nova proposta para o cliente.</p></div></div><div class="client-feedback-reason-v17"><small>Motivo informado em ${safe(feedback.proposalCode)}</small><strong>${safe(feedback.reason)}</strong><span>${safe(feedback.by)} · ${formatDateTime(feedback.at)}</span></div><details class="client-feedback-history-v17"><summary>Ver histórico de retornos (${ensureBudgetFeedbackV17(order).length})</summary>${history}</details></section>`;
    return html.replace('<div class="card-body stack">',`<div class="card-body stack">${alert}`);
  };

  const approvalSummaryBeforeV17=approvalSummaryV10;
  approvalSummaryV10=function(order){
    const base=approvalSummaryBeforeV17(order),feedback=latestBudgetFeedbackV17(order);
    if(!feedback)return base;
    return `${base}<div class="approval-last-return-v17"><strong>Último retorno do cliente:</strong> ${safe(feedback.reason)} <span>(${safe(feedback.proposalCode)} · ${formatDateTime(feedback.at)})</span></div>`;
  };

  const handleV8SecurityActionsBeforeV17=handleV8SecurityActions;
  handleV8SecurityActions=function(event){
    const target=event.target.closest('[data-action]');if(!target)return false;
    const action=target.dataset.action;
    if(action==='portal-reject-v17'){event.preventDefault();event.stopImmediatePropagation();openPortalRejectModalV17(target.dataset.id);return true;}
    if(action==='confirm-portal-reject-v17'){event.preventDefault();event.stopImmediatePropagation();confirmPortalRejectV17(target.dataset.id);return true;}
    return handleV8SecurityActionsBeforeV17(event);
  };

  const shellBeforeV17=shell;
  shell=function(content,route,portal=false,portalClientId=''){
    return shellBeforeV17(content,route,portal,portalClientId).replace(/<small>v16<\/small>/g,'<small>v17</small>');
  };



  /* ==============================================================
     AR7 V18 — proposta comercial entregue e visualizada no Portal
     ============================================================== */
  function cloneV18(value){return JSON.parse(JSON.stringify(value??null));}

  function proposalDeliveriesV18(order){
    order.portalProposalDeliveriesV18=Array.isArray(order.portalProposalDeliveriesV18)?order.portalProposalDeliveriesV18:[];
    return order.portalProposalDeliveriesV18;
  }

  function buildProposalDeliveryV18(order){
    const budget=ensureBudgetV11(order),approval=ensureApprovalV10(order),client=getClient(order.clientId),eq=getEquipment(order.equipmentId);
    const snapshotBudget=cloneV18(budget);
    if(budgetTotalsV11({...order,budget:snapshotBudget}).total<=0&&parseNumberV11(approval.amount)>0){snapshotBudget.laborPrice=String(approval.amount);snapshotBudget.taxPercent='0';snapshotBudget.discountPercent='0';snapshotBudget.discount='0';}
    return {
      id:id('prop'),proposalCode:budget.proposalCode,revision:Number(budget.revision||1),sentAt:budget.sentAt||approval.sentAt||new Date().toISOString(),
      clientId:order.clientId,orderId:order.id,orderNumber:order.number,
      budget:snapshotBudget,parts:cloneV18(order.parts||[]),defect:order.defect||'',diagnosis:order.records?.diagnosis||'',
      client:{id:client?.id||order.clientId,name:client?.name||'Cliente',contact:client?.contact||'',email:client?.email||''},
      equipment:{id:eq?.id||order.equipmentId,tag:eq?.tag||'',description:equipmentDescription(eq),serial:eq?.serial||'',manufacturer:eq?.manufacturer||'',power:eq?.power||''}
    };
  }

  function ensureProposalDeliveryV18(order){
    if(!order)return null;
    const budget=ensureBudgetV11(order),approval=ensureApprovalV10(order);
    const wasSent=Boolean(budget.sentAt);
    if(!wasSent)return null;
    const list=proposalDeliveriesV18(order);
    let delivery=list.find(item=>item.proposalCode===budget.proposalCode);
    if(!delivery){delivery=buildProposalDeliveryV18(order);list.push(delivery);}
    return delivery;
  }

  function currentProposalDeliveryV18(order){
    if(!order)return null;
    const budget=ensureBudgetV11(order);
    return proposalDeliveriesV18(order).find(item=>item.proposalCode===budget.proposalCode)||ensureProposalDeliveryV18(order);
  }

  function proposalDeliveryOrderV18(order,delivery){
    return {...cloneV18(order),defect:delivery?.defect??order.defect,records:{...(cloneV18(order.records)||{}),diagnosis:delivery?.diagnosis??order.records?.diagnosis},parts:cloneV18(delivery?.parts||order.parts||[]),budget:cloneV18(delivery?.budget||ensureBudgetV11(order))};
  }

  function portalProposalStatusV18(order,delivery){
    const feedback=ensureBudgetFeedbackV17(order).find(item=>item.proposalCode===delivery.proposalCode);
    if(feedback)return {label:feedback.type==='rejected'?'Negada':'Ajuste solicitado',tone:feedback.type==='rejected'?'red':'amber'};
    const approval=ensureApprovalV10(order),budget=ensureBudgetV11(order);
    if(delivery.proposalCode===budget.proposalCode&&approvalGrantedV10(order))return {label:'Aprovada',tone:'green'};
    if(delivery.proposalCode===budget.proposalCode&&order.stage==='aprovacao'&&approval.status===APPROVAL_STATUS_V10.WAITING)return {label:'Aguardando decisão',tone:'amber'};
    return {label:'Versão anterior',tone:'gray'};
  }

  function migrateV18(){
    let changed=false;
    for(const order of db.orders||[]){
      const budget=ensureBudgetV11(order),approval=ensureApprovalV10(order);
      if(budget.sentAt||approval.sentAt||order.stage==='aprovacao'||approvalGrantedV10(order)){
        const before=proposalDeliveriesV18(order).length;ensureProposalDeliveryV18(order);if(proposalDeliveriesV18(order).length!==before)changed=true;
      }
    }
    if(db.version!==18){db.version=18;changed=true;}
    if(changed)saveDB();
  }
  migrateV18();

  const sendBudgetToClientBeforeV18=sendBudgetToClientV11;
  sendBudgetToClientV11=function(orderId){
    const order=getOrder(orderId);if(!order)return;
    const beforeCode=ensureBudgetV11(order).proposalCode;
    sendBudgetToClientBeforeV18(orderId);
    const updated=getOrder(orderId);if(!updated)return;
    const budget=ensureBudgetV11(updated),approval=ensureApprovalV10(updated);
    if(updated.stage==='aprovacao'&&approval.status===APPROVAL_STATUS_V10.WAITING&&budget.sentAt&&budget.proposalCode===beforeCode){
      const list=proposalDeliveriesV18(updated);
      const old=list.findIndex(item=>item.proposalCode===budget.proposalCode);
      const delivery=buildProposalDeliveryV18(updated);
      if(old>=0)list[old]=delivery;else list.push(delivery);
      saveDB();render({resetScroll:true});
    }
  };

  const portalMenuItemsBeforeV18=portalMenuItemsV13;
  portalMenuItemsV13=function(clientId){
    const items=portalMenuItemsBeforeV18(clientId).filter(item=>item[3]!=='portal-proposals');
    const approvalIndex=items.findIndex(item=>item[3]==='portal-approvals');
    items.splice(Math.max(0,approvalIndex),0,[`portal-proposals/${clientId}`,'Propostas Comerciais','file','portal-proposals']);
    return items;
  };

  function portalProposalsViewV18(clientId){
    const client=portalClientV13(clientId);if(!client)return notFoundView();
    const orders=portalOrdersV13(client);
    const deliveries=orders.flatMap(order=>{
      ensureProposalDeliveryV18(order);
      return proposalDeliveriesV18(order).map(delivery=>({order,delivery}));
    }).sort((a,b)=>String(b.delivery.sentAt||'').localeCompare(String(a.delivery.sentAt||'')));
    const cards=deliveries.map(({order,delivery})=>{
      const eq=getEquipment(order.equipmentId),status=portalProposalStatusV18(order,delivery),viewOrder=proposalDeliveryOrderV18(order,delivery),total=budgetTotalsV11(viewOrder).total;
      const current=delivery.proposalCode===ensureBudgetV11(order).proposalCode&&order.stage==='aprovacao'&&ensureApprovalV10(order).status===APPROVAL_STATUS_V10.WAITING;
      return `<article class="portal-proposal-card-v18"><div class="portal-proposal-card-head-v18"><div><span>PROPOSTA COMERCIAL</span><h3>${safe(delivery.proposalCode)}</h3><p>OS #${safe(order.number)} · ${safe(eq?.tag||delivery.equipment?.tag||'—')} · ${safe(equipmentDescription(eq)||delivery.equipment?.description||'Equipamento')}</p></div>${badge(status.label,status.tone)}</div><div class="portal-proposal-meta-v18"><div><small>Enviada em</small><strong>${formatDateTime(delivery.sentAt)}</strong></div><div><small>Investimento</small><strong>${moneyV11(total)}</strong></div><div><small>Validade</small><strong>${formatDate(delivery.budget?.validUntil)}</strong></div><div><small>Revisão</small><strong>R${String(delivery.revision).padStart(2,'0')}</strong></div></div><div class="portal-proposal-actions-v18"><a class="btn btn-primary" href="#portal-proposal/${delivery.id}">${icon('file',15)} Abrir proposta comercial</a>${current?`<a class="btn btn-success" href="#portal-approvals/${client.id}">${icon('check',15)} Analisar aprovação</a>`:''}</div></article>`;
    }).join('');
    return shell(`<div class="page portal-page">${pageHead('Propostas comerciais','Documentos comerciais enviados oficialmente pela AR7 para esta empresa.')}<section class="portal-isolation-notice">${icon('check',18)}<div><strong>Documentos de ${safe(client.name)}</strong><span>Somente propostas efetivamente enviadas pela AR7 aparecem aqui. Revisões anteriores permanecem disponíveis para rastreabilidade.</span></div></section><div class="portal-proposals-list-v18">${cards||'<div class="empty">Nenhuma proposta comercial foi enviada para esta empresa.</div>'}</div></div>`,'portal-proposals',true,client.id);
  }

  function portalProposalViewV18(proposalRef){
    let order=null,delivery=null;
    for(const candidate of db.orders||[]){const found=proposalDeliveriesV18(candidate).find(item=>item.id===proposalRef);if(found){order=candidate;delivery=found;break;}}
    if(!order){order=getOrder(proposalRef);delivery=order?currentProposalDeliveryV18(order):null;}
    if(!order||!delivery)return notFoundView();
    const client=resolvePortalClientV8();if(!portalOrderAllowedV8(order,client,false))return notFoundView();
    if(!delivery.openedAt){delivery.openedAt=new Date().toISOString();saveDB();}
    const viewOrder=proposalDeliveryOrderV18(order,delivery),status=portalProposalStatusV18(order,delivery),approval=ensureApprovalV10(order),current=delivery.proposalCode===ensureBudgetV11(order).proposalCode&&order.stage==='aprovacao'&&approval.status===APPROVAL_STATUS_V10.WAITING;
    const actions=current?`<div class="portal-proposal-decisionbar-v18"><div><strong>Esta proposta aguarda sua decisão</strong><span>Leia o documento acima antes de aprovar, solicitar ajuste ou negar.</span></div><div><button class="btn btn-danger" data-action="portal-reject-v17" data-id="${order.id}">Negar</button><button class="btn btn-light" data-action="portal-adjustment-v10" data-id="${order.id}">Solicitar ajuste</button><button class="btn btn-success" data-action="portal-approval-v10" data-id="${order.id}">${icon('check',15)} Aprovar proposta</button></div></div>`:`<div class="portal-proposal-readonly-v18">${icon('file',18)}<div><strong>${safe(status.label)}</strong><span>Esta revisão está disponível somente para consulta e rastreabilidade.</span></div></div>`;
    return shell(`<div class="page portal-page portal-proposal-page-v18">${pageHead(`Proposta ${safe(delivery.proposalCode)}`,'Documento técnico-comercial recebido da AR7.',`<a class="btn btn-light" href="#portal-proposals/${client.id}">Voltar para propostas</a><button class="btn btn-primary" data-action="print-proposal-v11">${icon('download')} Gerar / salvar PDF</button>`)}<section class="portal-proposal-received-v18"><div>${icon('check',18)}<span>Recebida em ${formatDateTime(delivery.sentAt)}</span></div>${badge(status.label,status.tone)}</section><section class="pdf-shell pdf-shell-v5"><div class="pdf-toolbar"><span>${icon('file',17)}</span><span>${safe(delivery.proposalCode)}.pdf</span><span style="margin-left:auto">3 páginas</span></div>${proposalDocumentV11(viewOrder)}</section>${actions}</div>`,'portal-proposal',true,client.id);
  }

  const portalApprovalCardsBeforeV18=portalApprovalCardsV13;
  portalApprovalCardsV13=function(client,orders){
    return orders.filter(order=>order.stage==='aprovacao'&&ensureApprovalV10(order).status===APPROVAL_STATUS_V10.WAITING).map(order=>{
      const approval=ensureApprovalV10(order),budget=ensureBudgetV11(order),eq=getEquipment(order.equipmentId),delivery=currentProposalDeliveryV18(order);
      const hasProposal=Boolean(delivery&&delivery.proposalCode===budget.proposalCode),portalTotal=hasProposal?budgetTotalsV11(proposalDeliveryOrderV18(order,delivery)).total:budgetTotalsV11(order).total;
      return `<article class="portal-approval-card-v10 portal-approval-card-v17 portal-approval-card-v18"><div class="portal-approval-card-head"><div><span>${safe(budget.proposalCode)} · OS #${safe(order.number)}</span><h3>${safe(equipmentDescription(eq))}</h3></div>${badge(hasProposal?'Proposta recebida · aguardando decisão':'Proposta indisponível',hasProposal?'amber':'red')}</div><div class="portal-approval-body-v10"><div><small>Escopo proposto</small><p>${safe(budget.technicalScope||approval.scope)}</p></div><div class="portal-approval-commercial-v10"><div><small>Investimento</small><strong>${moneyV11(portalTotal)}</strong></div><div><small>Validade</small><strong>${formatDate(budget.validUntil)}</strong></div></div><div class="proposal-received-callout-v18">${icon('file',20)}<div><strong>${hasProposal?'Proposta comercial disponível':'Aguardando documento comercial'}</strong><span>${hasProposal?`Abra ${safe(delivery.proposalCode)} para conferir escopo, materiais, valores, prazo, pagamento e garantia antes de decidir.`:'A decisão fica bloqueada até a AR7 enviar uma proposta comercial válida.'}</span></div></div></div><div class="portal-approval-actions-v10 portal-approval-actions-v17 portal-approval-actions-v18">${hasProposal?`<a class="btn btn-primary" href="#portal-proposal/${delivery.id}">${icon('file',15)} Visualizar proposta comercial</a>`:''}<button class="btn btn-danger" data-action="portal-reject-v17" data-id="${order.id}" ${hasProposal?'':'disabled'}>Negar orçamento</button><button class="btn btn-light" data-action="portal-adjustment-v10" data-id="${order.id}" ${hasProposal?'':'disabled'}>Solicitar ajuste</button><button class="btn btn-success" data-action="portal-approval-v10" data-id="${order.id}" ${hasProposal?'':'disabled'}>${icon('check')} Aprovar orçamento</button></div></article>`;
    }).join('');
  };

  const openPortalApprovalBeforeV18=openPortalApprovalModalV10;
  openPortalApprovalModalV10=function(orderId){
    const order=getOrder(orderId),client=resolvePortalClientV8();
    if(!portalOrderAllowedV8(order,client,false))return toast('Esta proposta não pertence à empresa conectada.','error');
    const delivery=currentProposalDeliveryV18(order),budget=ensureBudgetV11(order);
    if(!delivery||delivery.proposalCode!==budget.proposalCode)return toast('A aprovação está bloqueada até a proposta comercial ser enviada e disponibilizada no portal.','error');
    const viewOrder=proposalDeliveryOrderV18(order,delivery);
    openModal('Confirmar aprovação da proposta',`<div class="stack"><div class="approval-modal-summary-v10">${icon('file',24)}<div><strong>${safe(delivery.proposalCode)} · ${moneyV11(budgetTotalsV11(viewOrder).total)}</strong><p>Documento recebido em ${formatDateTime(delivery.sentAt)}. A autorização ficará vinculada exatamente a esta revisão.</p></div></div><div class="proposal-confirm-link-v18"><button class="btn btn-light" data-action="open-portal-proposal-v18" data-proposal="${delivery.id}">${icon('file',15)} Abrir proposta completa novamente</button></div><label class="approval-consent-v10"><input type="checkbox" id="portal-approval-consent-v10"><span>Confirmo que revisei a proposta comercial ${safe(delivery.proposalCode)}, incluindo escopo, investimento, materiais, prazo, pagamento e garantia, e autorizo a AR7 a prosseguir.</span></label><div class="form-group"><label>Comentário opcional</label><textarea class="textarea" id="portal-approval-comment-v10" placeholder="Número do pedido, observação interna ou condição adicional..."></textarea></div></div>`,`<button class="btn btn-light" data-action="close-modal">Cancelar</button><button class="btn btn-success" data-action="confirm-portal-approval-v10" data-id="${order.id}">${icon('check')} Confirmar aprovação</button>`);
  };

  confirmPortalApprovalV10=function(orderId){
    const client=resolvePortalClientV8(),order=getOrder(orderId);
    if(!portalOrderAllowedV8(order,client,false))return toast('Esta proposta não pertence à empresa conectada.','error');
    const delivery=currentProposalDeliveryV18(order),budget=ensureBudgetV11(order),approval=ensureApprovalV10(order);
    if(!delivery||delivery.proposalCode!==budget.proposalCode)return toast('Aprovação bloqueada: a proposta comercial atual não está disponível no portal.','error');
    if(!document.getElementById('portal-approval-consent-v10')?.checked)return toast('Confirme que revisou a proposta comercial antes de aprovar.','error');
    if(order.stage!=='aprovacao'||approval.status!==APPROVAL_STATUS_V10.WAITING)return toast('Esta proposta não está aguardando aprovação da empresa.','error');
    approval.status=APPROVAL_STATUS_V10.APPROVED;approval.decidedAt=new Date().toISOString();approval.decidedBy=client.contact||client.name||'Responsável da empresa';approval.decisionChannel=PORTAL_APPROVAL_SOURCE_V13;approval.portalApprovedByClientId=client.id;approval.portalApprovalId=id('pa');approval.clientComment=(document.getElementById('portal-approval-comment-v10')?.value||'').trim();approval.approvedProposalCodeV18=delivery.proposalCode;approval.approvedProposalDeliveryIdV18=delivery.id;
    delivery.decision='approved';delivery.decidedAt=approval.decidedAt;delivery.decidedBy=approval.decidedBy;
    moveAfterApprovalV10(order,`${approval.decidedBy} pelo Portal do Cliente · ${delivery.proposalCode}`);
    saveDB();closeModal();render({resetScroll:true});toast(`Proposta ${delivery.proposalCode} aprovada pela empresa.`);
  };

  const openPortalAdjustmentBeforeV18=openPortalAdjustmentModalV10;
  openPortalAdjustmentModalV10=function(orderId){const order=getOrder(orderId),delivery=currentProposalDeliveryV18(order);if(!delivery||delivery.proposalCode!==ensureBudgetV11(order).proposalCode)return toast('A solicitação de ajuste está bloqueada até a proposta comercial atual estar disponível no portal.','error');return openPortalAdjustmentBeforeV18(orderId);};
  const confirmPortalAdjustmentBeforeV18=confirmPortalAdjustmentV10;
  confirmPortalAdjustmentV10=function(orderId){const order=getOrder(orderId),delivery=currentProposalDeliveryV18(order);if(!delivery||delivery.proposalCode!==ensureBudgetV11(order).proposalCode)return toast('A proposta comercial atual não está disponível para decisão.','error');return confirmPortalAdjustmentBeforeV18(orderId);};
  const openPortalRejectBeforeV18=openPortalRejectModalV17;
  openPortalRejectModalV17=function(orderId){const order=getOrder(orderId),delivery=currentProposalDeliveryV18(order);if(!delivery||delivery.proposalCode!==ensureBudgetV11(order).proposalCode)return toast('A negativa está bloqueada até a proposta comercial atual estar disponível no portal.','error');return openPortalRejectBeforeV18(orderId);};
  const confirmPortalRejectBeforeV18=confirmPortalRejectV17;
  confirmPortalRejectV17=function(orderId){const order=getOrder(orderId),delivery=currentProposalDeliveryV18(order);if(!delivery||delivery.proposalCode!==ensureBudgetV11(order).proposalCode)return toast('A proposta comercial atual não está disponível para decisão.','error');return confirmPortalRejectBeforeV18(orderId);};

  const registerClientBudgetReturnBeforeV18=registerClientBudgetReturnV17;
  registerClientBudgetReturnV17=function(order,type,reason,client){
    const delivery=currentProposalDeliveryV18(order);
    const feedback=registerClientBudgetReturnBeforeV18(order,type,reason,client);
    const approval=ensureApprovalV10(order);approval.sentAt='';
    if(delivery){delivery.decision=type;delivery.decidedAt=feedback.at;delivery.decidedBy=feedback.by;delivery.decisionReason=reason;}
    return feedback;
  };

  function handlePortalProposalActionsV18(event){const target=event.target.closest?.('[data-action]');if(!target||target.dataset.action!=='open-portal-proposal-v18')return;event.preventDefault();event.stopImmediatePropagation();const proposalId=target.dataset.proposal;closeModal();if(proposalId)location.hash=`#portal-proposal/${proposalId}`;}
  document.addEventListener('click',handlePortalProposalActionsV18,true);

  const portalDashboardBeforeV18=portalDashboardV13;
  portalDashboardV13=function(client){
    let html=portalDashboardBeforeV18(client);
    const count=portalOrdersV13(client).reduce((sum,order)=>sum+proposalDeliveriesV18(order).length,0);
    const shortcut=`<a href="#portal-proposals/${client.id}">${icon('file')} Propostas comerciais <strong>${count}</strong></a>`;
    html=html.replace('<div class="card-body portal-shortcuts-v13">',`<div class="card-body portal-shortcuts-v13">${shortcut}`);
    return html;
  };

  const portalOrdersBeforeV18=portalOrdersViewV13;
  portalOrdersViewV13=function(clientId){
    const client=portalClientV13(clientId);if(!client)return notFoundView();
    const orders=portalOrdersV13(client),rows=orders.map(order=>{const eq=getEquipment(order.equipmentId),delivery=currentProposalDeliveryV18(order);const proposal=delivery?`<a class="btn btn-light btn-sm" href="#portal-proposal/${delivery.id}">${icon('file',14)} Proposta</a>`:'';const primary=order.stage==='aprovacao'?`<a class="btn btn-primary btn-sm" href="#portal-approvals/${client.id}">Analisar</a>`:order.report?.sent?`<button class="btn btn-light btn-sm" data-action="portal-report" data-id="${order.id}">Relatório técnico</button>`:'<span>Acompanhamento</span>';return `<tr><td><strong>OS #${safe(order.number)}</strong></td><td>${safe(eq?.tag||'—')}<br><small>${safe(equipmentDescription(eq))}</small></td><td>${badge(stageLabel(order.stage),stageTone(order.stage))}</td><td>${formatDate(order.entryDate)}</td><td>${formatDate(order.dueDate)}</td><td><div class="row-actions">${proposal}${primary}</div></td></tr>`;}).join('');
    return shell(`<div class="page portal-page">${pageHead('Ordens de serviço','Situação atual, documentos e prazos de todas as ordens da empresa.')}<section class="card"><div class="table-wrap"><table class="table"><thead><tr><th>OS</th><th>Equipamento</th><th>Etapa</th><th>Entrada</th><th>Previsão</th><th>Ação</th></tr></thead><tbody>${rows||'<tr><td colspan="6"><div class="empty">Nenhuma ordem registrada.</div></td></tr>'}</tbody></table></div></section></div>`,'portal-orders',true,client.id);
  };

  const portalRouteForCompanyBeforeV18=portalRouteForCompanyV16;
  portalRouteForCompanyV16=function(route,clientId){
    if(route==='portal-proposals'||route==='portal-proposal')return `#portal-proposals/${clientId}`;
    return portalRouteForCompanyBeforeV18(route,clientId);
  };

  const shellBeforeV18=shell;
  shell=function(content,route,portal=false,portalClientId=''){
    return shellBeforeV18(content,route,portal,portalClientId).replace(/<small>v17<\/small>/g,'<small>v18</small>');
  };

  render=function(options={}){
    ensureDeletedOrdersV14();
    const {route,param}=parseRoute(),routeKey=`${route}/${param||''}`,resetScroll=options?.resetScroll===true||Boolean(renderedRouteKeyV7&&renderedRouteKeyV7!==routeKey),state=resetScroll?null:captureUIStateV7();
    const views={dashboard:dashboardView,orders:()=>ordersView(param),'trash-orders':trashOrdersViewV14,clients:clientsView,client:()=>clientDetailView(param),equipment:equipmentView,parts:()=>partsView(param),budgets:budgetsViewV11,proposal:()=>proposalViewV11(param),workshop:workshopView,reports:()=>reportsView(param),portal:()=>portalDashboardV13(portalClientV13(param)),'portal-equipment':()=>portalEquipmentViewV13(param),'portal-orders':()=>portalOrdersViewV13(param),'portal-reports':()=>portalReportsViewV13(param),'portal-proposals':()=>portalProposalsViewV18(param),'portal-proposal':()=>portalProposalViewV18(param),'portal-approvals':()=>portalApprovalsViewV13(param),'portal-history':()=>portalHistoryViewV13(param),'portal-photos':()=>portalPhotosViewV13(param),'portal-report':()=>portalReportViewV8(param),settings:settingsView,order:()=>orderDetailView(param)};
    try{document.getElementById('app').innerHTML=(views[route]||notFoundView)();renderedRouteKeyV7=routeKey;requestAnimationFrame(()=>{enhancePageV12();if(resetScroll)window.scrollTo(0,0);else restoreUIStateV7(state);});}catch(error){console.error('Falha ao renderizar',error);document.getElementById('app').innerHTML=`<div class="fatal-error"><h1>Não foi possível abrir esta tela</h1><p>${safe(error.message)}</p><a href="#dashboard">Voltar ao dashboard</a></div>`;}
  };



  /* =========================
     AR7 V19 — dashboard executivo, responsividade e reset controlado das OS
     ========================= */
  const OS_RESET_FLAG_V19='ar7-v19-os-reset-20260807';
  function applyOrderResetV19(){
    try{
      if(localStorage.getItem(OS_RESET_FLAG_V19)==='1')return false;
      db.orders=[];
      db.deletedOrders=[];
      db.activity=(Array.isArray(db.activity)?db.activity:[]).filter(item=>!/(\bOS\b|ordem de servi[cç]o|proposta|or[cç]amento)/i.test(String(item?.text||'')));
      db.version=20;
      localStorage.setItem(OS_RESET_FLAG_V19,'1');
      saveDB();
      return true;
    }catch(error){console.warn('Não foi possível aplicar o reset controlado das OS da V19.',error);return false;}
  }
  // V20.2.3: não apague OS automaticamente em um navegador novo. O reset permanece somente como ação explícita em Configurações.


  function monthSeriesV19(count=6){
    const now=new Date(),months=[];
    for(let offset=count-1;offset>=0;offset--){
      const date=new Date(now.getFullYear(),now.getMonth()-offset,1);
      const key=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;
      months.push({key,label:new Intl.DateTimeFormat('pt-BR',{month:'short'}).format(date).replace('.',''),entries:0,completed:0});
    }
    for(const order of db.orders||[]){
      const entryKey=String(order.entryDate||'').slice(0,7),entry=months.find(item=>item.key===entryKey);if(entry)entry.entries++;
      if(order.stage==='concluida'){
        const completedDate=order.report?.sentAt||order.availableSince||order.dueDate||order.entryDate||'';
        const completeKey=String(completedDate).slice(0,7),done=months.find(item=>item.key===completeKey);if(done)done.completed++;
      }
    }
    return months;
  }
  function monthlyBarsV19(){
    const data=monthSeriesV19(6),max=Math.max(1,...data.flatMap(item=>[item.entries,item.completed]));
    const hasData=data.some(item=>item.entries||item.completed);
    return `<div class="chart-panel-v19"><div class="chart-legend-v19"><span><i class="legend-dot-v19 entry"></i>Entradas</span><span><i class="legend-dot-v19 done"></i>Concluídas</span></div>${hasData?`<div class="monthly-chart-v19" role="img" aria-label="Entradas e ordens concluídas nos últimos seis meses">${data.map(item=>`<div class="month-group-v19"><div class="month-bars-v19"><div class="month-bar-v19 entry" style="height:${Math.max(item.entries?12:3,(item.entries/max)*100)}%"><b>${item.entries}</b></div><div class="month-bar-v19 done" style="height:${Math.max(item.completed?12:3,(item.completed/max)*100)}%"><b>${item.completed}</b></div></div><span>${safe(item.label)}</span></div>`).join('')}</div>`:`<div class="chart-empty-v19">${icon('chart',34)}<strong>Sem histórico de OS ainda</strong><span>O gráfico será preenchido automaticamente conforme as novas ordens entrarem e forem concluídas.</span></div>`}</div>`;
  }
  function portfolioDonutV19(){
    const groups=[
      {label:'Entrada / diagnóstico',value:(db.orders||[]).filter(o=>['entrada','diagnostico'].includes(o.stage)).length,color:'#c9202f'},
      {label:'Comercial',value:(db.orders||[]).filter(o=>['cotacao','orcamento','aprovacao'].includes(o.stage)).length,color:'#e39a24'},
      {label:'Execução',value:(db.orders||[]).filter(o=>['pecas','montagem','testes'].includes(o.stage)).length,color:'#477a7c'},
      {label:'Relatório / concluída',value:(db.orders||[]).filter(o=>['relatorio','concluida'].includes(o.stage)).length,color:'#239257'}
    ];
    const total=groups.reduce((sum,item)=>sum+item.value,0);
    let cursor=0,segments=[];
    for(const item of groups){const start=cursor,end=cursor+(total?item.value/total*100:0);if(item.value)segments.push(`${item.color} ${start}% ${end}%`);cursor=end;}
    const bg=total?`conic-gradient(${segments.join(',')})`:'conic-gradient(#ece9ec 0 100%)';
    return `<div class="donut-layout-v19"><div class="donut-v19" style="background:${bg}"><div><strong>${total}</strong><span>OS no total</span></div></div><div class="donut-legend-v19">${groups.map(item=>`<a href="#orders/${item.label==='Comercial'?'orcamento':item.label==='Execução'?'montagem':item.label.startsWith('Relatório')?'relatorio':'open'}"><i style="background:${item.color}"></i><span>${safe(item.label)}</span><strong>${item.value}</strong></a>`).join('')}</div></div>`;
  }
  function deadlineHealthV19(){
    const open=(db.orders||[]).filter(order=>order.stage!=='concluida');
    const today=new Date(`${todayISO()}T12:00:00`),soon=new Date(today);soon.setDate(soon.getDate()+3);
    const late=open.filter(order=>order.dueDate&&new Date(`${order.dueDate}T12:00:00`)<today).length;
    const attention=open.filter(order=>order.dueDate&&new Date(`${order.dueDate}T12:00:00`)>=today&&new Date(`${order.dueDate}T12:00:00`)<=soon).length;
    const healthy=Math.max(0,open.length-late-attention),total=Math.max(1,open.length);
    const rows=[['No prazo',healthy,'good'],['Atenção (até 3 dias)',attention,'warn'],['Atrasadas',late,'bad']];
    return `<div class="deadline-chart-v19">${rows.map(([label,value,tone])=>`<a href="#orders/open" class="deadline-row-v19"><div><span>${safe(label)}</span><strong>${value}</strong></div><div class="deadline-track-v19"><i class="${tone}" style="width:${open.length?(value/total*100):0}%"></i></div></a>`).join('')}${open.length?`<small>${late?`${late} OS exigem atenção imediata.`:'Nenhuma OS atrasada neste momento.'}</small>`:'<small>Sem ordens abertas para avaliar prazo.</small>'}</div>`;
  }
  function clientsWorkloadV19(){
    const items=(db.clients||[]).map(client=>({client,value:(db.orders||[]).filter(order=>order.clientId===client.id&&order.stage!=='concluida').length})).sort((a,b)=>b.value-a.value).slice(0,6),max=Math.max(1,...items.map(item=>item.value));
    return `<div class="client-bars-v19">${items.map(item=>`<a href="#client/${item.client.id}" class="client-bar-row-v19"><div><span>${safe(item.client.name)}</span><strong>${item.value}</strong></div><div class="client-bar-track-v19"><i style="width:${item.value/max*100}%"></i></div></a>`).join('')||'<div class="chart-empty-v19 compact"><strong>Nenhum cliente cadastrado</strong></div>'}</div>`;
  }
  dashboardView=function(){
    const counts=Object.fromEntries(STAGES.map(stage=>[stage.id,(db.orders||[]).filter(order=>order.stage===stage.id).length]));
    const open=(db.orders||[]).filter(order=>order.stage!=='concluida'),openCount=open.length;
    const today=new Date(`${todayISO()}T12:00:00`),overdue=open.filter(order=>order.dueDate&&new Date(`${order.dueDate}T12:00:00`)<today).length;
    const pendingReports=(db.orders||[]).filter(order=>order.stage==='relatorio'||(order.stage==='concluida'&&!order.report?.sent)).length;
    const pendingParts=(db.orders||[]).flatMap(order=>order.parts||[]).filter(part=>!['Recebida','Separada','Instalada'].includes(part.status)).length;
    const commercial=(counts.cotacao||0)+(counts.orcamento||0)+(counts.aprovacao||0),execution=(counts.pecas||0)+(counts.montagem||0)+(counts.testes||0);
    const monthKey=todayISO().slice(0,7),completedMonth=(db.orders||[]).filter(order=>order.stage==='concluida'&&String(order.report?.sentAt||order.availableSince||order.dueDate||'').slice(0,7)===monthKey).length;
    const color={entrada:'#7b7780',diagnostico:'#c9202f',cotacao:'#477a7c',orcamento:'#62556e',aprovacao:'#e69a13',pecas:'#ba7d11',montagem:'#9e1722',testes:'#477a7c',relatorio:'#706c73',concluida:'#239257'};
    const queue=STAGES.map(stage=>{const list=(db.orders||[]).filter(order=>order.stage===stage.id);return `<section class="kanban-col"><a class="kanban-head kanban-head-link" href="#orders/${stage.id}" style="border-bottom-color:${color[stage.id]||'#c9202f'}"><span>${safe(stage.label)}</span><span>${list.length} ${icon('arrow',12)}</span></a><div class="kanban-list">${list.slice(0,4).map(order=>{const eq=getEquipment(order.equipmentId),client=getClient(order.clientId);return `<article class="os-mini" tabindex="0" role="button" data-action="open-order" data-id="${order.id}"><strong>OS #${safe(order.number)}</strong><p>${safe(equipmentDescription(eq))}</p><p>${safe(client?.name||'Cliente')}</p><div class="mini-status">${stage.id==='orcamento'?badge(ensureBudgetV11(order).status,budgetStatusToneV11(ensureBudgetV11(order).status)):stage.id==='aprovacao'?badge(approvalLabelV10(order),approvalToneV10(approvalLabelV10(order))):badge(formatDate(order.dueDate),order.dueDate&&new Date(`${order.dueDate}T12:00:00`)<today?'red':'gray')}</div></article>`;}).join('')||'<div class="empty compact"><span>Nenhuma OS</span></div>'}${list.length>4?`<a class="queue-more" href="#orders/${stage.id}">+ ${list.length-4} na fila</a>`:''}</div></section>`;}).join('');
    const metric=(value,label,caption,iconName,href,tone='red')=>`<a class="executive-kpi-v19 ${tone}" href="${href}"><span class="executive-kpi-icon-v19">${icon(iconName,21)}</span><div><small>${safe(label)}</small><strong>${value}</strong><p>${safe(caption)}</p></div>${icon('arrow',15)}</a>`;
    return shell(`<div class="page dashboard-page dashboard-v19">${pageHead('Painel da operação','Indicadores reais da oficina, comercial, compras e qualidade em uma visão única.',`<button class="btn btn-primary" data-action="new-order">${icon('plus')} Nova ordem de serviço</button>`)}
      <section class="executive-kpis-v19">${metric(openCount,'OS abertas','Todas as ordens em andamento','clipboard','#orders/open','red')}${metric(counts.diagnostico||0,'Em diagnóstico','Aguardando definição técnica','tools','#orders/diagnostico','dark')}${metric(commercial,'Fluxo comercial','Cotação, orçamento e cliente','file','#budgets','amber')}${metric(execution,'Em execução','Materiais, montagem e testes','gear','#workshop','teal')}${metric(completedMonth,'Concluídas no mês','Serviços finalizados neste mês','check','#orders/concluida','green')}</section>
      <section class="dashboard-chart-grid-v19"><article class="card chart-card-v19 chart-wide-v19"><div class="card-head"><div><h2>Movimentação da oficina</h2><p>Entradas x conclusões nos últimos 6 meses</p></div>${badge('Dados reais','green')}</div><div class="card-body">${monthlyBarsV19()}</div></article><article class="card chart-card-v19"><div class="card-head"><div><h2>Carteira por macroetapa</h2><p>Onde as OS estão concentradas</p></div></div><div class="card-body">${portfolioDonutV19()}</div></article></section>
      <section class="card queue-card queue-card-v19"><div class="card-head"><div><h2>Fila operacional</h2><p>Fluxo completo da entrada à conclusão. No tablet e celular, deslize horizontalmente entre as etapas.</p></div><a href="#orders/open" class="table-link">Ver todas</a></div><div class="card-body"><div class="kanban kanban-v19" data-preserve-scroll="dashboard-kanban">${queue}</div></div></section>
      <section class="dashboard-lower-grid-v19"><article class="card chart-card-v19"><div class="card-head"><div><h2>Saúde dos prazos</h2><p>OS abertas por criticidade de entrega</p></div>${overdue?badge(`${overdue} atrasada(s)`,'red'):badge('Sem atraso','green')}</div><div class="card-body">${deadlineHealthV19()}</div></article><article class="card chart-card-v19"><div class="card-head"><div><h2>Demanda por cliente</h2><p>Quantidade de OS abertas por empresa</p></div></div><div class="card-body">${clientsWorkloadV19()}</div></article><article class="card chart-card-v19"><div class="card-head"><div><h2>Pendências críticas</h2><p>Atalhos para o que precisa de ação</p></div></div><div class="card-body alert-list"><a class="alert-item alert-link" href="#orders/aprovacao"><div class="alert-icon tone-amber">${icon('clock')}</div><div><strong>${counts.aprovacao||0} aguardando cliente</strong><p>Propostas sem decisão.</p></div>${icon('arrow',16)}</a><a class="alert-item alert-link" href="#parts"><div class="alert-icon tone-red">${icon('alert')}</div><div><strong>${pendingParts} materiais pendentes</strong><p>Cotação, compra ou recebimento.</p></div>${icon('arrow',16)}</a><a class="alert-item alert-link" href="#reports"><div class="alert-icon tone-blue">${icon('file')}</div><div><strong>${pendingReports} relatórios pendentes</strong><p>Revisar ou enviar ao cliente.</p></div>${icon('arrow',16)}</a></div></article></section>
    </div>`,'dashboard');
  };

  const shellBeforeV19=shell;
  shell=function(content,route,portal=false,portalClientId=''){
    return shellBeforeV19(content,route,portal,portalClientId).replace(/<small>v18<\/small>/g,'<small>v19</small>');
  };

  document.addEventListener('pointerdown',signaturePointerDownV9);
  document.addEventListener('pointermove',signaturePointerMoveV9);
  document.addEventListener('pointerup',signaturePointerUpV9);
  document.addEventListener('pointercancel',signaturePointerUpV9);

  function toast(message,type='success'){const region=document.getElementById('toast-region');if(!region)return;while(region.children.length>=3)region.firstElementChild?.remove();const el=document.createElement('div');el.className=`toast ${type}`;el.textContent=message;region.appendChild(el);setTimeout(()=>el.remove(),2600);}

  function reloadFromSharedStorageV7(){try{const incoming=normalizeAfterLoadV5(JSON.parse(localStorage.getItem(DB_KEY)));if(incoming){db=incoming;render();}}catch(error){console.warn('Não foi possível sincronizar a atualização',error);}}
  syncChannelV7?.addEventListener('message',event=>{if(event.data?.type==='db-update'&&event.data.source!==tabIdV7)reloadFromSharedStorageV7();});
  window.addEventListener('storage',event=>{if(event.key===DB_KEY)reloadFromSharedStorageV7();});
  document.addEventListener('click',handleV7SupplementalClick);

  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&currentModal){event.preventDefault();currentModal.querySelector('.modal')?.classList.add('modal-attention-v12');setTimeout(()=>currentModal?.querySelector('.modal')?.classList.remove('modal-attention-v12'),260);toast('Use os botões Cancelar ou Fechar para sair sem perder informações.','error');}});
  document.addEventListener('click',event=>{if(event.target?.id==='modal-backdrop'){event.preventDefault();event.stopPropagation();currentModal?.querySelector('.modal')?.classList.add('modal-attention-v12');setTimeout(()=>currentModal?.querySelector('.modal')?.classList.remove('modal-attention-v12'),260);}});
  document.addEventListener('click',openDatePicker,true);
  document.addEventListener('pointerdown',handleAnnotationPointerDown);
  document.addEventListener('pointermove',handleAnnotationPointerMove);
  document.addEventListener('pointerup',handleAnnotationPointerUp);
  document.addEventListener('input',event=>{if(event.target.id==='client-search'){const term=event.target.value.toLowerCase();document.querySelectorAll('.client-card').forEach(card=>{card.hidden=!card.textContent.toLowerCase().includes(term);});}if(event.target.id==='arrow-color'&&arrowEditorState)arrowEditorState.color=event.target.value;if(event.target.id==='arrow-width'&&arrowEditorState)arrowEditorState.width=Number(event.target.value);});

  document.addEventListener('click',handleClick);
  document.addEventListener('change',handleInput);
  document.addEventListener('input',event=>{if(event.target.id==='order-search'||event.target.id==='order-stage-filter')handleFilter();});
  window.addEventListener('hashchange',render);
  document.addEventListener('click',event=>{if(event.target.id==='sidebar-overlay'){document.getElementById('sidebar')?.classList.remove('open');event.target.hidden=true;}});
  if('serviceWorker' in navigator) window.addEventListener('load',async()=>{try{const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.map(reg=>reg.unregister()));if('caches' in window){const keys=await caches.keys();await Promise.all(keys.map(key=>caches.delete(key)));}}catch{}});

  /* =========================
     AR7 V20.1 — banco central, fotos e sincronização multi-dispositivo
     ========================= */
  const saveDBLocalV20=saveDB;
  const REMOTE_SYNC_INTERVAL_V20=5000;
  const REMOTE_REVISION_KEY_V2022='ar7-remote-revision-v2022';
  const REMOTE_PENDING_KEY_V2022='ar7-remote-pending-v2022';
  let remoteRevisionV20=Number(localStorage.getItem(REMOTE_REVISION_KEY_V2022)||0)||0;
  let remoteDirtyV20=localStorage.getItem(REMOTE_PENDING_KEY_V2022)==='1';
  let remoteSaveInFlightV20=false;
  let remoteSaveTimerV20=null;
  let remotePollTimerV20=null;
  let remoteAuthenticatedV20=false;
  let remoteInitialSyncDoneV20=false;
  let remoteConflictV2022=false;

  function remoteStatusV20(state,message=''){
    document.documentElement.dataset.ar7Sync=state;
    let badge=document.getElementById('ar7-sync-badge-v20');
    if(!badge){
      badge=document.createElement('div');badge.id='ar7-sync-badge-v20';badge.className='sync-badge-v20';document.body.appendChild(badge);
    }
    const labels={online:'Banco central conectado',saving:'Salvando no banco...',offline:'Sem conexão com o banco',syncing:'Sincronizando...',local:'Modo local',conflict:'Conflito de edição — toque para recarregar'};
    badge.className=`sync-badge-v20 ${state}`;
    badge.textContent=message||labels[state]||state;
    badge.title=state==='conflict'?'Outro dispositivo salvou antes. Toque para recarregar com segurança.':'AR7 V20.2.3 — sincronização entre dispositivos';
    badge.dataset.conflict=state==='conflict'?'1':'0';
  }

  async function fetchV20(url,options={}){
    return fetch(url,{credentials:'same-origin',cache:'no-store',...options,headers:{'Accept':'application/json',...(options.body?{'Content-Type':'application/json'}:{}),...(options.headers||{})}});
  }

  function loginOverlayV20(){
    return new Promise(resolve=>{
      document.getElementById('ar7-login-v20')?.remove();
      const overlay=document.createElement('div');overlay.id='ar7-login-v20';overlay.className='login-gate-v20';
      overlay.innerHTML=`<div class="login-card-v20"><img src="./assets/ar7-logo.png" alt="AR7"><small>AR7 Gestão da Oficina</small><h1>Acesso ao sistema</h1><p>Entre para carregar o banco central compartilhado da oficina.</p><form id="ar7-login-form-v20"><label>Usuário<input id="ar7-login-user-v20" autocomplete="username" value="admin" required></label><label>Senha<input id="ar7-login-pass-v20" type="password" autocomplete="current-password" required></label><div id="ar7-login-error-v20" class="login-error-v20"></div><button class="btn btn-primary" type="submit">Entrar e sincronizar</button></form></div>`;
      document.body.appendChild(overlay);
      const form=overlay.querySelector('form'),user=overlay.querySelector('#ar7-login-user-v20'),pass=overlay.querySelector('#ar7-login-pass-v20'),error=overlay.querySelector('#ar7-login-error-v20');
      setTimeout(()=>pass.focus(),50);
      form.addEventListener('submit',async event=>{
        event.preventDefault();error.textContent='';const button=form.querySelector('button');button.disabled=true;button.textContent='Entrando...';
        try{
          const response=await fetchV20('/api/auth/login',{method:'POST',body:JSON.stringify({username:user.value.trim(),password:pass.value})});
          const payload=await response.json().catch(()=>({}));
          if(!response.ok){error.textContent=payload.error||'Não foi possível entrar.';button.disabled=false;button.textContent='Entrar e sincronizar';return;}
          overlay.remove();remoteAuthenticatedV20=true;resolve(true);
        }catch(e){error.textContent='Servidor indisponível. Verifique sua conexão.';button.disabled=false;button.textContent='Entrar e sincronizar';}
      });
    });
  }

  async function ensureRemoteAuthV20(){
    try{
      const response=await fetchV20('/api/auth/status');
      if(response.ok){remoteAuthenticatedV20=true;return true;}
      if(response.status===503){remoteStatusV20('local','Banco central ainda não configurado');return false;}
    }catch(error){remoteStatusV20('offline');return false;}
    return loginOverlayV20();
  }

  function markRemotePendingV2022(){
    remoteDirtyV20=true;
    try{localStorage.setItem(REMOTE_PENDING_KEY_V2022,'1');localStorage.setItem(REMOTE_REVISION_KEY_V2022,String(remoteRevisionV20||0));}catch{}
  }
  function clearRemotePendingV2022(){
    remoteDirtyV20=false;
    try{localStorage.removeItem(REMOTE_PENDING_KEY_V2022);localStorage.setItem(REMOTE_REVISION_KEY_V2022,String(remoteRevisionV20||0));}catch{}
  }

  async function pushRemoteStateV20(){
    if(remoteSaveInFlightV20||!remoteAuthenticatedV20)return false;
    remoteSaveInFlightV20=true;remoteStatusV20('saving');
    try{
      const response=await fetchV20('/api/state',{method:'PUT',body:JSON.stringify({data:db,clientVersion:APP_RELEASE,expectedRevision:remoteRevisionV20})});
      if(response.status===401){remoteAuthenticatedV20=false;await ensureRemoteAuthV20();remoteSaveInFlightV20=false;return pushRemoteStateV20();}
      const payload=await response.json().catch(()=>({}));
      if(response.status===409&&payload.conflict){
        remoteConflictV2022=true;markRemotePendingV2022();
        try{localStorage.setItem('ar7-sync-conflict-backup-v2022',JSON.stringify({savedAt:new Date().toISOString(),expectedRevision:remoteRevisionV20,currentRevision:Number(payload.currentRevision||0),data:db}));}catch{}
        remoteStatusV20('conflict','Outro dispositivo salvou antes — toque aqui para recarregar');
        toast('Conflito de sincronização detectado. Seus dados locais foram preservados; recarregue o banco antes de continuar.','error');
        return false;
      }
      if(!response.ok)throw new Error(payload.error||`HTTP ${response.status}`);
      remoteRevisionV20=Number(payload.revision||remoteRevisionV20||0);clearRemotePendingV2022();remoteConflictV2022=false;remoteStatusV20('online');return true;
    }catch(error){console.warn('Falha ao sincronizar com banco central',error);markRemotePendingV2022();remoteStatusV20('offline','Alteração salva neste dispositivo; banco aguardando conexão');return false;}
    finally{remoteSaveInFlightV20=false;}
  }

  function scheduleRemoteSaveV20(){
    markRemotePendingV2022();
    if(remoteConflictV2022){remoteStatusV20('conflict','Outro dispositivo salvou antes — toque aqui para recarregar');return;}
    clearTimeout(remoteSaveTimerV20);
    remoteSaveTimerV20=setTimeout(()=>{pushRemoteStateV20();},350);
  }

  saveDB=function(){
    const localOk=saveDBLocalV20();
    if(remoteInitialSyncDoneV20)scheduleRemoteSaveV20();
    else markRemotePendingV2022();
    return localOk||remoteAuthenticatedV20;
  };

  async function pullRemoteStateV20(initial=false){
    if(!remoteAuthenticatedV20||remoteSaveInFlightV20||(!initial&&remoteDirtyV20))return false;
    if(initial&&remoteDirtyV20){
      const pushed=await pushRemoteStateV20();
      if(!pushed)return false;
    }
    if(initial)remoteStatusV20('syncing');
    try{
      const response=await fetchV20('/api/state');
      if(response.status===401){remoteAuthenticatedV20=false;if(await ensureRemoteAuthV20())return pullRemoteStateV20(initial);return false;}
      if(response.status===404){
        remoteInitialSyncDoneV20=true;
        const uploaded=await pushRemoteStateV20();
        if(uploaded)toast('Banco central criado com os dados deste dispositivo.');
        return uploaded;
      }
      const payload=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(payload.error||`HTTP ${response.status}`);
      const incoming=normalizeAfterLoadV5(payload.data);
      const incomingRevision=Number(payload.revision||0);
      if(incoming&&(initial||incomingRevision>remoteRevisionV20)){
        db=incoming;db.version=APP_VERSION;
        try{localStorage.setItem(DB_KEY,JSON.stringify(db));}catch(error){console.warn('Cache local cheio; dados continuam disponíveis pelo banco central.',error);}
        remoteRevisionV20=incomingRevision;
        try{localStorage.setItem(REMOTE_REVISION_KEY_V2022,String(remoteRevisionV20||0));}catch{}
        if(remoteInitialSyncDoneV20||initial)render();
      }
      remoteInitialSyncDoneV20=true;clearRemotePendingV2022();remoteStatusV20('online');return true;
    }catch(error){console.warn('Banco central indisponível',error);remoteInitialSyncDoneV20=true;remoteStatusV20('offline');return false;}
  }

  async function initRemoteSyncV20(){
    remoteStatusV20('syncing');
    const authenticated=await ensureRemoteAuthV20();
    if(!authenticated){remoteInitialSyncDoneV20=true;return;}
    const hadPending=localStorage.getItem(REMOTE_PENDING_KEY_V2022)==='1';
    if(hadPending){
      remoteInitialSyncDoneV20=true;
      const pushed=await pushRemoteStateV20();
      if(remoteConflictV2022){
        clearInterval(remotePollTimerV20);
        remotePollTimerV20=setInterval(()=>{if(!remoteConflictV2022&&remoteDirtyV20)pushRemoteStateV20();else if(!remoteConflictV2022)pullRemoteStateV20(false);},REMOTE_SYNC_INTERVAL_V20);
        return;
      }
      if(!pushed){
        clearInterval(remotePollTimerV20);
        remotePollTimerV20=setInterval(()=>{if(!remoteConflictV2022&&remoteDirtyV20)pushRemoteStateV20();else if(!remoteConflictV2022)pullRemoteStateV20(false);},REMOTE_SYNC_INTERVAL_V20);
        return;
      }
    }
    await pullRemoteStateV20(true);
    clearInterval(remotePollTimerV20);
    remotePollTimerV20=setInterval(()=>{if(!remoteConflictV2022&&remoteDirtyV20)pushRemoteStateV20();else if(!remoteConflictV2022)pullRemoteStateV20(false);},REMOTE_SYNC_INTERVAL_V20);
  }

  document.addEventListener('click',async event=>{
    const badge=event.target.closest?.('#ar7-sync-badge-v20');
    if(!badge||badge.dataset.conflict!=='1')return;
    const proceed=confirm('Outro dispositivo salvou alterações antes deste. Uma cópia de segurança local foi preservada. Recarregar agora com os dados mais recentes do banco central?');
    if(!proceed)return;
    remoteConflictV2022=false;remoteDirtyV20=false;
    await pullRemoteStateV20(true);
    toast('Dados mais recentes do banco central carregados.');
  });

  const shellBeforeV20=shell;
  shell=function(content,route,portal=false,portalClientId=''){
    return shellBeforeV20(content,route,portal,portalClientId).replace(/<small>v19<\/small>/g,'<small>v20.1</small>');
  };


  /* =========================
     AR7 V20.2 — UX mobile, fluxo compacto, orçamento separado e relatório otimizado
     ========================= */
  function applyStageNamesV202(){
    const pieces=STAGES.find(stage=>stage.id==='cotacao');
    const review=STAGES.find(stage=>stage.id==='orcamento');
    if(pieces)Object.assign(pieces,{label:'Peças do orçamento',team:'Compras',short:'Cadastrar peças, origem e custo unitário'});
    if(review)Object.assign(review,{label:'Revisão da proposta',team:'Comercial / Supervisor',short:'Definir valores e condições comerciais'});
  }
  applyStageNamesV202();

  function migrateCommercialValuesV202(order){
    if(!order)return false;
    const quotation=ensureQuotationV11(order),budget=ensureBudgetV11(order);
    let changed=false;
    const transfer=(from,to)=>{
      if(!String(budget[to]??'').trim()&&String(quotation[from]??'').trim()){budget[to]=quotation[from];changed=true;}
      if(String(quotation[from]??'').trim()){quotation[from]='';changed=true;}
    };
    transfer('laborCost','laborPrice');
    transfer('thirdPartyCost','thirdPartyPrice');
    transfer('otherCost','otherPrice');
    const oldFreight=(order.parts||[]).reduce((sum,part)=>{
      const quote=selectedQuoteV11(part);return sum+parseNumberV11(quote?.freight);
    },0);
    if(oldFreight>0&&!parseNumberV11(budget.freightPrice)){budget.freightPrice=String(oldFreight);changed=true;}
    (order.parts||[]).forEach(part=>(part.quotations||[]).forEach(quote=>{if(parseNumberV11(quote.freight)){quote.freight='';changed=true;}}));
    return changed;
  }

  function budgetReadyForReviewV202(order){
    const budget=ensureBudgetV11(order),totals=budgetTotalsV11(order),chargeRequired=budget.billingType==='Normal';
    return Boolean(budget.technicalScope?.trim().length>=20&&(!chargeRequired||totals.total>0)&&budget.paymentTerms?.trim()&&budget.warranty?.trim()&&budget.validUntil&&budget.recipient?.includes('@'));
  }

  function partAdvanceReadyV202(order,part){
    const next=purchaseNextStatusV8(part?.status||'');
    if(!next)return false;
    if(next==='Comprada'){
      const selected=selectedQuoteV11(part);
      const supplyReady=Boolean(partSupplier(part))||quoteIsValidV11(selected);
      return approvalGrantedV10(order)&&supplyReady;
    }
    if(next==='Recebida')return part.status==='Comprada';
    if(next==='Separada')return part.status==='Recebida'&&Boolean(partLocation(part)||part.purchase?.location);
    return true;
  }

  collectQuotationV11=function(order){
    const quotation=ensureQuotationV11(order),read=(field,current='')=>document.getElementById(field)?.value??current;
    quotation.responsible=String(read('quotation-responsible-v11',quotation.responsible)).trim();
    quotation.notes=String(read('quotation-notes-v11',quotation.notes)).trim();
    const parts=order.parts||[];
    quotation.status=parts.length&&parts.every(part=>quoteIsValidV11(selectedQuoteV11(part)))?QUOTATION_STATUS_V11.COMPLETE:QUOTATION_STATUS_V11.IN_PROGRESS;
    if(quotation.status===QUOTATION_STATUS_V11.COMPLETE&&!quotation.completedAt)quotation.completedAt=new Date().toISOString();
    return quotation;
  };

  quotationTotalsV11=function(order){
    ensureQuotationV11(order);
    const partsCost=(order.parts||[]).reduce((sum,part)=>sum+selectedQuoteCostV11(part),0);
    return {partsCost,laborCost:0,thirdPartyCost:0,otherCost:0,totalCost:partsCost};
  };

  // V20.2: a primeira etapa comercial registra somente a peça e seu valor unitário.
  // Frete/logística e demais acréscimos ficam exclusivamente na revisão da proposta.
  selectedQuoteCostV11=function(part){
    const quote=selectedQuoteV11(part);
    if(!quote||quote.source==='Fornecida pelo cliente')return 0;
    return parseNumberV11(quote.unitPrice)*quantityNumberV11(part);
  };

  openSupplierQuoteModalV11=function(orderId,partId,quoteId=''){
    const order=getOrder(orderId),part=order?.parts.find(item=>item.id===partId);if(!part)return;
    const quote=quoteId?(part.quotations||[]).find(item=>item.id===quoteId):normalizeSupplierQuoteV11({source:'Fornecedor'});if(!quote)return;
    openModal(quoteId?'Editar peça / opção de fornecimento':'Nova peça / opção de fornecimento',`<form id="supplier-quote-form-v11" class="form-grid"><input type="hidden" name="orderId" value="${safe(orderId)}"><input type="hidden" name="partId" value="${safe(partId)}"><input type="hidden" name="quoteId" value="${safe(quoteId)}"><div class="technical-callout span-2"><span>${icon('gear',20)}</span><div><strong>${safe(part.name)}</strong>${safe(part.code||'Sem código')} · ${safe(part.dimensions||'Sem medidas')} · ${safe(partQuantity(part))}</div></div><div class="form-group"><label>Origem da peça *</label><select class="select" name="source">${QUOTE_SOURCES_V11.map(source=>`<option ${quote.source===source?'selected':''}>${safe(source)}</option>`).join('')}</select></div><div class="form-group"><label>Fornecedor</label><input class="input" name="supplier" value="${safe(quote.supplier)}" placeholder="Obrigatório para compra externa"></div><div class="form-group"><label>Marca / fabricante</label><input class="input" name="brand" value="${safe(quote.brand)}"></div><div class="form-group"><label>Valor unitário da peça</label><input class="input" name="unitPrice" inputmode="decimal" value="${safe(quote.unitPrice)}" placeholder="0,00"></div><div class="form-group"><label>Previsão de entrega</label><input class="input" type="date" name="expectedDate" value="${safe(quote.expectedDate)}"></div><div class="form-group"><label>Nº da cotação</label><input class="input" name="quoteNumber" value="${safe(quote.quoteNumber)}"></div><div class="form-group span-2"><label>Local no estoque</label><input class="input" name="stockLocation" value="${safe(quote.stockLocation)}" placeholder="Obrigatório somente para estoque próprio"></div><div class="form-group span-2"><label>Observação da peça</label><textarea class="textarea auto-grow-v202" name="note">${safe(quote.note)}</textarea></div><div class="commercial-field-redirect-v202 span-2">Frete, mão de obra, terceiros, tributos, desconto e demais valores comerciais são definidos somente na etapa <strong>Revisar proposta</strong>.</div></form>`,`<button class="btn btn-light" data-action="close-modal">Cancelar</button><button class="btn btn-primary" data-action="save-supplier-quote-v11">${icon('save')} Salvar peça</button>`);
  };

  quotationCardsV11=function(order){
    return (order.parts||[]).map(part=>{
      const quotes=part.quotations||[],selected=selectedQuoteV11(part);
      const quoteRows=quotes.map(quote=>`<article class="supplier-quote-v11 ${quote.selected?'selected':''}"><div class="supplier-quote-main-v11"><div><span>${safe(quote.source)}</span><strong>${safe(quote.source==='Fornecedor'?quote.supplier:quote.source)}</strong><small>${quote.brand?safe(quote.brand):'Marca não informada'}${quote.quoteNumber?` · Cotação ${safe(quote.quoteNumber)}`:''}</small></div><div class="quote-price-v11"><strong>${moneyV11(parseNumberV11(quote.unitPrice)*quantityNumberV11(part))}</strong><small>${quote.source==='Fornecedor'?`${moneyV11(quote.unitPrice)} / ${safe(part.unit||'un')}`:quote.source}</small></div></div><div class="supplier-quote-meta-v11"><span>${quote.expectedDate?`Previsão da peça: ${formatDate(quote.expectedDate)}`:'Prazo da peça não informado'}</span><span>${quote.stockLocation?`Estoque: ${safe(quote.stockLocation)}`:' '}</span></div><div class="row-actions"><button class="btn btn-light btn-sm" data-action="edit-supplier-quote-v11" data-order="${order.id}" data-part="${part.id}" data-quote="${quote.id}">${icon('edit',14)} Editar peça</button>${quote.selected?`<span class="selected-quote-label-v11">${icon('check',14)} Selecionada</span>`:`<button class="btn btn-primary btn-sm" data-action="select-supplier-quote-v11" data-order="${order.id}" data-part="${part.id}" data-quote="${quote.id}">Selecionar peça</button>`}<button class="icon-danger" data-action="remove-supplier-quote-v11" data-order="${order.id}" data-part="${part.id}" data-quote="${quote.id}" aria-label="Excluir opção">${icon('trash',14)}</button></div></article>`).join('');
      return `<section class="quote-part-card-v11"><div class="quote-part-head-v11"><div><span>${safe(part.position||'Aplicação não informada')}</span><h3>${safe(part.name)}</h3><p>Código: ${safe(part.code||'—')} · Medidas: ${safe(part.dimensions||'—')} · ${safe(partQuantity(part))}</p></div>${selected?badge('Peça definida','green'):badge('Falta definir','red')}</div><div class="supplier-quotes-grid-v11">${quoteRows||'<div class="empty compact"><strong>Nenhuma opção registrada</strong><span>Inclua fornecedor, estoque próprio ou peça fornecida pelo cliente.</span></div>'}</div><button class="btn btn-light btn-sm" data-action="add-supplier-quote-v11" data-order="${order.id}" data-part="${part.id}">${icon('plus',14)} Adicionar opção da peça</button></section>`;
    }).join('');
  };

  quotationWorkspaceV11=function(order){
    migrateCommercialValuesV202(order);
    const quotation=ensureQuotationV11(order),totals=quotationTotalsV11(order),client=getClient(order.clientId),eq=getEquipment(order.equipmentId),parts=order.parts||[];
    return `<section class="card stage-workspace quotation-workspace-v11 quotation-parts-only-v202"><div class="card-head"><div><div class="section-eyebrow">PEÇAS PARA O ORÇAMENTO · INTERNO</div><h2>Cadastro, cotação e escolha das peças</h2><p>Nesta primeira parte ficam somente as peças e as opções de fornecimento. Frete comercial, mão de obra, terceiros, tributos e descontos são definidos na revisão da proposta.</p></div>${badge(quotation.status,quotation.status===QUOTATION_STATUS_V11.COMPLETE?'green':'amber')}</div><div class="card-body stack"><div class="commercial-flow-strip-v11"><span class="done">1 Diagnóstico</span><span class="active">2 Peças do orçamento</span><span>3 Revisar proposta</span><span>4 Cliente</span><span>5 Compra</span></div><div class="quotation-context-v11"><div><small>OS / Cliente</small><strong>OS #${safe(order.number)} · ${safe(client?.name)}</strong></div><div><small>Equipamento</small><strong>${safe(eq?.tag)} · ${safe(equipmentDescription(eq))}</strong></div><div class="wide"><small>Diagnóstico</small><p>${safe(order.records?.diagnosis||'Não registrado')}</p></div></div><div class="quotation-parts-toolbar-v202"><div><small>PEÇAS CADASTRADAS</small><strong>${parts.length}</strong></div><div><small>CUSTO DAS OPÇÕES SELECIONADAS</small><strong id="quotation-parts-preview-v12">${moneyV11(totals.partsCost)}</strong></div><div class="form-group"><label for="quotation-responsible-v11">Responsável por Compras *</label><input class="input" id="quotation-responsible-v11" value="${safe(quotation.responsible)}" placeholder="Nome do responsável"></div></div>${quotationCardsV11(order)}<div class="quotation-note-v202"><div class="form-group"><label for="quotation-notes-v11">Observação sobre as peças</label><textarea class="textarea auto-grow-v202" id="quotation-notes-v11" placeholder="Equivalências, indisponibilidade, prazo crítico ou observações da cotação...">${safe(quotation.notes)}</textarea></div></div></div></section>`;
  };

  const stageRequirementsBeforeV202=stageRequirements;
  stageRequirements=function(order){
    if(order.stage==='cotacao'){
      const quotation=ensureQuotationV11(order),parts=order.parts||[];
      return [
        {label:'Responsável por Compras informado',ok:Boolean(quotation.responsible?.trim())},
        {label:'Todas as peças possuem uma opção de fornecimento válida selecionada',ok:parts.length>0&&parts.every(part=>quoteIsValidV11(selectedQuoteV11(part)))}
      ];
    }
    if(order.stage==='orcamento'){
      const budget=ensureBudgetV11(order),baseReady=budgetReadyForReviewV202(order);
      return [
        {label:'Escopo, valores e condições comerciais preenchidos',ok:baseReady},
        {label:'Proposta enviada para revisão interna',ok:[BUDGET_STATUS_V11.REVIEW,BUDGET_STATUS_V11.INTERNAL_APPROVED,BUDGET_STATUS_V11.SENT].includes(budget.status)},
        {label:'Proposta aprovada internamente pelo supervisor',ok:[BUDGET_STATUS_V11.INTERNAL_APPROVED,BUDGET_STATUS_V11.SENT].includes(budget.status)}
      ];
    }
    return stageRequirementsBeforeV202(order);
  };

  const handoffButtonLabelBeforeV202=handoffButtonLabelV5;
  handoffButtonLabelV5=function(order){
    if(order.stage==='cotacao')return 'Peças conferidas: liberar revisão da proposta';
    if(order.stage==='orcamento')return 'Proposta pronta: enviar ao cliente';
    if(order.stage==='aprovacao')return approvalGrantedV10(order)?'Aprovação registrada: liberar próxima equipe':'Aguardando aprovação do cliente';
    return handoffButtonLabelBeforeV202(order);
  };

  budgetWorkspaceV11=function(order){
    migrateCommercialValuesV202(order);
    const budget=ensureBudgetV11(order),totals=budgetTotalsV11(order),quotation=quotationTotalsV11(order),client=getClient(order.clientId),eq=getEquipment(order.equipmentId);
    const readyForReview=budgetReadyForReviewV202(order),canApprove=budget.status===BUDGET_STATUS_V11.REVIEW,canSend=budget.status===BUDGET_STATUS_V11.INTERNAL_APPROVED;
    const parts=(order.parts||[]).map(part=>{const quote=selectedQuoteV11(part);return `<tr><td><strong>${safe(part.name)}</strong><small>${safe(part.position||'Aplicação não informada')}</small></td><td>${safe(part.code||'—')}</td><td>${safe(partQuantity(part))}</td><td>${safe(quote?.supplier||quote?.source||'—')}</td><td>${moneyV11(selectedQuoteCostV11(part))}</td></tr>`;}).join('');
    return `<section class="card stage-workspace budget-workspace-v11 budget-review-v202"><div class="card-head"><div><div class="section-eyebrow">PROPOSTA ${safe(budget.proposalCode)}</div><h2>Revisar proposta e definir valores comerciais</h2><p>As peças chegam prontas da etapa anterior. Aqui ficam todos os valores comerciais, frete, descontos, tributos, prazo e condições que serão apresentados ao cliente.</p></div>${badge(budget.status,budgetStatusToneV11(budget.status))}</div><div class="card-body stack"><div class="commercial-flow-strip-v11"><span class="done">1 Diagnóstico</span><span class="done">2 Peças do orçamento</span><span class="active">3 Revisar proposta</span><span>4 Cliente</span><span>5 Compra</span></div><section class="budget-parts-readonly-v202"><div class="stage-photo-head"><div><div class="section-eyebrow">PEÇAS JÁ DEFINIDAS</div><h3>Resumo vindo de Compras</h3><p>Somente consulta nesta tela. Para trocar fornecedor ou peça, volte à etapa Peças do orçamento.</p></div><strong>${moneyV11(quotation.partsCost)}</strong></div><div class="table-wrap"><table class="table"><thead><tr><th>Peça</th><th>Código</th><th>Qtd.</th><th>Fornecedor / origem</th><th>Custo selecionado</th></tr></thead><tbody>${parts||'<tr><td colspan="5"><div class="empty compact">Serviço sem peças cadastradas.</div></td></tr>'}</tbody></table></div></section><div class="budget-internal-cost-v11"><div><small>Custo interno das peças</small><strong id="budget-cost-preview-v12">${moneyV11(quotation.partsCost)}</strong><span>Referência interna · não aparece ao cliente</span></div><div><small>Valor de venda calculado</small><strong id="budget-total-preview-v11">${moneyV11(totals.total)}</strong><span id="budget-margin-preview-v12">Margem bruta estimada: ${moneyV11(totals.total-quotation.partsCost)}</span></div></div><div class="budget-editor-layout-v11"><div class="stack"><section class="budget-form-section-v11"><h3>Escopo e enquadramento</h3><div class="form-grid"><div class="form-group"><label for="budget-billing-type-v11">Tipo de atendimento</label><select class="select" id="budget-billing-type-v11">${BILLING_TYPES_V11.map(type=>`<option ${budget.billingType===type?'selected':''}>${safe(type)}</option>`).join('')}</select></div><div class="form-group"><label for="budget-valid-v11">Validade da proposta *</label><input class="input" type="date" id="budget-valid-v11" value="${safe(budget.validUntil)}"></div><div class="form-group span-2"><label for="budget-scope-v11">Escopo técnico e comercial *</label><textarea class="textarea stage-large-text auto-grow-v202" id="budget-scope-v11">${safe(budget.technicalScope)}</textarea></div></div></section><section class="budget-form-section-v11 commercial-values-v202"><h3>Valores comerciais</h3><p class="section-help-v202">Todos os acréscimos e descontos da proposta ficam concentrados aqui.</p><div class="form-grid"><div class="form-group"><label for="budget-parts-markup-v11">Margem nas peças (%)</label><input class="input budget-calc-v11" id="budget-parts-markup-v11" inputmode="decimal" value="${safe(budget.partsMarkup)}"></div><div class="form-group"><label for="budget-labor-v11">Mão de obra para o cliente</label><input class="input budget-calc-v11" id="budget-labor-v11" inputmode="decimal" value="${safe(budget.laborPrice)}"></div><div class="form-group"><label for="budget-third-party-v11">Serviços de terceiros</label><input class="input budget-calc-v11" id="budget-third-party-v11" inputmode="decimal" value="${safe(budget.thirdPartyPrice)}"></div><div class="form-group"><label for="budget-freight-v11">Frete / logística</label><input class="input budget-calc-v11" id="budget-freight-v11" inputmode="decimal" value="${safe(budget.freightPrice)}"></div><div class="form-group"><label for="budget-other-v11">Outros valores</label><input class="input budget-calc-v11" id="budget-other-v11" inputmode="decimal" value="${safe(budget.otherPrice)}"></div><div class="form-group"><label for="budget-tax-v11">Tributos (%)</label><input class="input budget-calc-v11" id="budget-tax-v11" inputmode="decimal" value="${safe(budget.taxPercent)}"></div><div class="form-group"><label for="budget-discount-v11">Desconto (%)</label><input class="input budget-calc-v11" id="budget-discount-v11" inputmode="decimal" type="number" min="0" max="100" step="0.01" value="${safe(budget.discountPercent??'0')}"><small>Aplicado sobre o subtotal antes dos tributos.</small></div></div></section><section class="budget-form-section-v11"><h3>Condições da proposta</h3><div class="form-grid"><div class="form-group"><label for="budget-payment-v11">Condição de pagamento *</label><input class="input" id="budget-payment-v11" value="${safe(budget.paymentTerms)}"></div><div class="form-group"><label for="budget-execution-v11">Prazo após aprovação (dias úteis)</label><input class="input" id="budget-execution-v11" type="number" min="0" value="${safe(budget.executionDays)}"></div><div class="form-group span-2"><label for="budget-warranty-v11">Garantia *</label><textarea class="textarea auto-grow-v202" id="budget-warranty-v11">${safe(budget.warranty)}</textarea></div><div class="form-group span-2"><label for="budget-recipient-v11">E-mail do cliente *</label><input class="input" type="email" id="budget-recipient-v11" value="${safe(budget.recipient||client?.email||'')}"></div><div class="form-group span-2"><label for="budget-notes-v11">Observações comerciais</label><textarea class="textarea auto-grow-v202" id="budget-notes-v11">${safe(budget.commercialNotes)}</textarea></div></div></section></div><aside class="budget-preview-card-v11"><div class="budget-preview-head-v11"><img src="./assets/ar7-logo.png" alt="AR7"><div><span>${safe(budget.proposalCode)}</span><strong>Prévia da proposta</strong></div></div><div class="budget-preview-client-v11"><small>Cliente</small><strong>${safe(client?.name)}</strong><span>${safe(eq?.tag)} · ${safe(equipmentDescription(eq))}</span></div><div id="budget-summary-preview-v12">${budgetSummaryTableV11(order,true)}</div><div class="budget-preview-terms-v11" id="budget-terms-preview-v12"><p><strong>Pagamento:</strong> ${safe(budget.paymentTerms)}</p><p><strong>Prazo:</strong> ${safe(budget.executionDays)} dias úteis após aprovação e disponibilidade dos materiais.</p><p><strong>Validade:</strong> ${formatDate(budget.validUntil)}</p></div></aside></div><div class="budget-workflow-actions-v11 readiness-actions-v202"><button class="btn btn-light" data-action="save-budget-v11" data-id="${order.id}">${icon('save')} Salvar rascunho</button><button class="btn btn-light" data-action="view-proposal-v11" data-id="${order.id}">${icon('file')} Visualizar proposta</button><button class="btn ${readyForReview?'btn-success':'btn-light readiness-pending-v202'}" data-action="submit-budget-review-v11" data-id="${order.id}" ${readyForReview?'':'disabled'}>${readyForReview?icon('check',15):icon('clock',15)} ${readyForReview?'Pronto: enviar para revisão':'Complete os dados para revisar'}</button><button class="btn ${canApprove?'btn-success':'btn-light readiness-pending-v202'}" data-action="approve-budget-internal-v11" data-id="${order.id}" ${canApprove?'':'disabled'}>${icon(canApprove?'check':'clock',15)} ${canApprove?'Pronto: aprovar internamente':'Aguardando revisão interna'}</button><button class="btn ${canSend?'btn-success':'btn-light readiness-pending-v202'}" data-action="send-budget-client-v11" data-id="${order.id}" ${canSend?'':'disabled'}>${icon(canSend?'send':'clock',15)} ${canSend?'Pronto: enviar ao cliente':'Aguardando aprovação interna'}</button></div>${budget.internalReviewer?`<div class="internal-review-note-v11">${icon('check',18)}<div><strong>Revisado por ${safe(budget.internalReviewer)}</strong><span>${budget.internalApprovedAt?formatDateTime(budget.internalApprovedAt):''}${budget.internalReviewNote?` · ${safe(budget.internalReviewNote)}`:''}</span></div></div>`:''}</div></section>`;
  };

  function purchaseActionLabelV2022(next){
    return ({'Em cotação':'Iniciar cotação','Comprada':'Confirmar compra','Recebida':'Confirmar recebimento','Separada':'Confirmar separação'})[next]||`Avançar para ${next||'próxima etapa'}`;
  }

  partsTableV5=function(order,purchaseMode=false){
    const workshopInstallMode=order.stage==='montagem'&&!purchaseMode;
    const rows=(order.parts||[]).map(part=>{
      const next=purchaseMode?purchaseNextStatusV8(part.status):'';let actions='';
      if(purchaseMode){
        const ready=partAdvanceReadyV202(order,part),label=next?purchaseActionLabelV2022(next):'';
        const why=next==='Comprada'&&!approvalGrantedV10(order)?'Aguardando aprovação do cliente':next==='Comprada'&&!partSupplier(part)&&!quoteIsValidV11(selectedQuoteV11(part))?'Complete fornecedor/cotação':'Complete os dados necessários';
        const purchaseAction=next?`<button class="btn ${ready?'btn-success':'btn-light readiness-pending-v202'} btn-sm" data-action="advance-part" data-order="${order.id}" data-part="${part.id}" ${ready?'':`disabled title="${safe(why)}"`}>${icon(ready?'check':'clock',14)} ${safe(ready?label:why)}</button>`:`<span class="purchase-handoff-status">${part.status==='Separada'?'Aguardando instalação na Oficina':'Instalada pela Oficina'}</span>`;
        actions=`<button class="btn btn-light btn-sm" data-action="edit-purchase" data-order="${order.id}" data-part="${part.id}">Dados da compra</button>${purchaseAction}`;
      }else if(workshopInstallMode){
        if(part.status==='Instalada')actions=`<span class="workshop-installed">${icon('check',14)} Instalada pela Oficina</span>`;
        else if(part.status==='Separada')actions=`<button class="btn btn-success btn-sm" data-action="install-part" data-order="${order.id}" data-part="${part.id}">${icon('check',14)} Pronto: confirmar instalação</button>`;
        else actions=`<button class="btn btn-light btn-sm readiness-pending-v202" disabled>${icon('clock',14)} Aguardando separação</button>`;
      }
      return `<tr><td>${part.photo?`<img class="part-photo" src="${safe(part.photo)}" alt="Foto da peça">`:'<span class="part-photo-placeholder">—</span>'}</td><td><strong>${safe(part.name)}</strong><br><span class="muted-small">${safe(part.position||'Aplicação não informada')}</span>${part.technicalNote?`<details class="inline-details"><summary>Especificação técnica</summary><p>${safe(part.technicalNote)}</p></details>`:''}</td><td>${safe(part.code||'—')}</td><td>${safe(part.dimensions||'—')}</td><td>${safe(partQuantity(part))}</td><td>${badge(part.status,partTone(part.status))}</td><td><div class="row-actions">${actions}</div></td></tr>`;
    }).join('');
    const actionTitle=purchaseMode?'Ação de Compras':workshopInstallMode?'Confirmação da Oficina':' ';
    return `<div class="table-wrap parts-table-wrap"><table class="table parts-table"><thead><tr><th>Foto</th><th>Peça / aplicação</th><th>Código</th><th>Medidas</th><th>Qtd.</th><th>Status</th><th>${actionTitle}</th></tr></thead><tbody>${rows||'<tr><td colspan="7"><div class="empty"><strong>Nenhuma peça informada</strong><span>Adicione uma necessidade técnica ou marque que o serviço não precisa de peças.</span></div></td></tr>'}</tbody></table></div>`;
  };

  partsView=function(filter=''){
    const all=db.orders.flatMap(order=>(order.parts||[]).map(part=>({...part,order}))),parts=all.filter(item=>typeof partsFilterV12==='function'?partsFilterV12(filter,item):true);
    const awaitingOrders=db.orders.filter(order=>approvalPendingV10(order)&&['aprovacao','pecas'].includes(order.stage)).length;
    const rows=parts.map(item=>{const eq=getEquipment(item.order.equipmentId),commercial=item.purchase||{},next=purchaseNextStatusV8(item.status),ready=partAdvanceReadyV202(item.order,item);const blockedReason=next==='Comprada'&&!approvalGrantedV10(item.order)?'Aguardando aprovação':next==='Comprada'&&!partSupplier(item)&&!quoteIsValidV11(selectedQuoteV11(item))?'Complete os dados da compra':'Aguardando condição';const actionLabel=ready&&next?purchaseActionLabelV2022(next):blockedReason;return `<tr><td>${item.photo?`<img class="part-photo" src="${safe(item.photo)}" alt="Foto da peça">`:'<span class="part-photo-placeholder">—</span>'}</td><td><div class="part-technical"><strong>${safe(item.name)}</strong><small>Código: ${safe(item.code||'não informado')}</small><small>Medidas: ${safe(item.dimensions||'não informadas')}</small><small>Aplicação: ${safe(item.position||'não informada')}</small></div></td><td><a class="table-link" href="#order/${item.order.id}">OS #${safe(item.order.number)}</a><br>${safe(eq?.tag||'—')} · ${safe(equipmentDescription(eq))}</td><td>${safe(partQuantity(item))}</td><td>${badge(item.status,partTone(item.status))}</td><td>${approvalColumnV10(item.order)}</td><td><div class="commercial-summary"><strong>${safe(commercial.supplier||selectedQuoteV11(item)?.supplier||'Compras ainda não preencheu')}</strong><span>${commercial.expectedDate?`Previsão: ${formatDate(commercial.expectedDate)}`:'Sem previsão'}</span><span>${commercial.quote?`Cotação/Pedido: ${safe(commercial.quote)}`:''}</span></div></td><td>${safe(commercial.location||'—')}</td><td><div class="row-actions"><button class="btn btn-light btn-sm" data-action="edit-purchase" data-order="${item.order.id}" data-part="${item.id}">${icon('edit',14)} Dados da compra</button>${next?`<button class="btn ${ready?'btn-success':'btn-light readiness-pending-v202'} btn-sm" data-action="advance-part" data-order="${item.order.id}" data-part="${item.id}" ${ready?'':`disabled title="${safe(blockedReason)}"`}>${icon(ready?'check':'clock',14)} ${safe(actionLabel)}</button>`:`<span class="purchase-handoff-status">${item.status==='Separada'?'Aguardando instalação na Oficina':'Instalada pela Oficina'}</span>`}</div></td></tr>`;}).join('');
    const pending=all.filter(part=>!['Recebida','Separada','Instalada'].includes(part.status)).length;
    return shell(`<div class="page">${pageHead('Peças e Compras',filter?`Filtro atual: ${safe(filter)}.`:'Os botões ficam verdes somente quando todas as condições para avançar estiverem atendidas.',`<button class="btn btn-primary" data-action="new-part-global">${icon('plus')} Nova solicitação técnica</button>`)}<div class="approval-rule-banner-v10" id="approval-blocked-help-v10">${icon('check',22)}<div><strong>Leitura rápida de liberação</strong><span>Botão verde = pronto para confirmar. Botão cinza = ainda existe condição pendente. Comprar exige aprovação válida do cliente.</span></div></div><div class="grid kpi-grid">${kpi(parts.length,'Itens neste filtro','gear','bg-blue')}${kpi(awaitingOrders,'Aguardando aprovação','clock','bg-amber','#orders/aprovacao','Ver aprovações')}${kpi(all.filter(p=>p.status==='Em cotação').length,'Em cotação','clipboard','bg-purple')}${kpi(all.filter(p=>p.status==='Comprada').length,'Comprados','box','bg-amber')}${kpi(pending,'Pendentes','clock','bg-red')}</div><section class="card"><div class="card-head"><div><h2>Fila integrada de materiais</h2><p>Compra, recebimento e separação seguem o mesmo padrão visual de prontidão.</p></div></div><div class="table-wrap"><table class="table"><thead><tr><th>Foto</th><th>Especificação técnica</th><th>OS / Equipamento</th><th>Qtd.</th><th>Material</th><th>Aprovação</th><th>Dados de Compras</th><th>Local</th><th>Ações</th></tr></thead><tbody>${rows||'<tr><td colspan="9"><div class="empty">Nenhuma peça cadastrada</div></td></tr>'}</tbody></table></div></section></div>`,'parts');
  };

  orderDetailView=function(orderId){
    const order=getOrder(orderId);if(!order)return notFoundView();order.records=order.records||{diagnosis:'',assembly:'',tests:'',conclusion:''};order.photos=order.photos||{before:[],during:[],assembly:[],after:[]};
    const client=getClient(order.clientId),eq=getEquipment(order.equipmentId),idx=stageIndex(order.stage),progress=Math.round((idx/(STAGES.length-1))*100),current=STAGES[idx],next=nextStageForOrder(order),requirements=stageRequirements(order),ready=requirements.every(item=>item.ok),nextTeam=order.stage==='concluida'?null:next;
    const stairs=STAGES.map((stage,i)=>`<button type="button" class="workflow-step ${i<idx?'done':''} ${i===idx?'current selected-v202':''} ${i>idx?'locked':''}" data-flow-index="${i}" data-flow-label="${safe(stage.label)}" data-flow-team="${safe(stage.team)}" data-flow-short="${safe(stage.short)}" data-flow-state="${i<idx?'Concluída':i===idx?'Etapa atual':'Pendente'}" ${i===idx?'aria-current="step"':''}><div class="workflow-step-top"><span>${i<idx?icon('check',14):i+1}</span><small>${safe(stage.team)}</small></div><strong>${safe(stage.label)}</strong><p>${safe(stage.short)}</p></button>`).join('');
    let primary='';
    if(order.stage==='relatorio')primary=`<button class="btn ${ready?'btn-success':'btn-light readiness-pending-v202'}" data-action="open-report" data-id="${order.id}">${icon(ready?'check':'file')} ${ready?'Pronto: abrir relatório':'Abrir relatório e concluir pendências'}</button>`;
    else if(order.stage==='concluida')primary=`<button class="btn btn-success" disabled>${icon('check')} Processo concluído</button>`;
    else primary=`<button class="btn ${ready?'btn-success':'btn-light readiness-pending-v202'}" data-action="advance-stage" data-id="${order.id}" ${ready?'':`disabled title="Conclua todos os requisitos desta etapa"`}>${icon(ready?'check':'clock',16)} ${safe(handoffButtonLabelV5(order))}</button>`;
    const handoffs=(order.handoffs||[]).slice().reverse().map(item=>`<div class="handoff-item"><span>${icon('arrow',14)}</span><div><strong>${safe(item.fromTeam)} → ${safe(item.toTeam)}</strong><small>${formatDateTime(item.at)}</small></div></div>`).join('');
    return shell(`<div class="page">${pageHead(`OS ${safe(order.number)}`,`${safe(client?.name)} · ${safe(eq?.tag)} · ${safe(equipmentDescription(eq))}`,`<button class="btn btn-light" data-action="open-report" data-id="${order.id}">${icon('file')} Relatório</button>`)}<section class="workflow-card workflow-card-v202"><div class="workflow-title"><div><span>Fluxo guiado</span><h2>Andamento da OS</h2><p class="workflow-subtitle-v202">Verde concluído · vermelho etapa atual · cinza próxima etapa</p></div>${badge(`${progress}% concluído`,progress===100?'green':'blue')}</div><div class="workflow-stair workflow-compact-v202">${stairs}</div><div class="workflow-selected-detail-v202" id="workflow-selected-detail-v202"><span>${safe(current.team)} · Etapa atual</span><strong>${safe(current.label)}</strong><small>${safe(current.short)}</small></div></section><section class="current-task current-task-v202"><div class="current-team"><small>ETAPA ATUAL</small><strong>${safe(current.team)}</strong><span>${safe(current.label)}</span></div><div class="task-body"><div><small>Conferência automática</small><div class="requirement-list">${requirements.map(item=>`<div class="requirement ${item.ok?'ok':'pending'}"><span>${icon(item.ok?'check':'clock',16)}</span><strong>${safe(item.label)}</strong></div>`).join('')}</div></div><div class="next-team"><small>${nextTeam?'PRÓXIMA EQUIPE':'PROCESSO'}</small><strong>${nextTeam?safe(nextTeam.team):'Encerrado'}</strong><span>${nextTeam?safe(nextTeam.label):'Disponível ao cliente'}</span></div></div><div class="task-actions readiness-actions-v202">${order.stage==='concluida'?'':`<button class="btn btn-light" data-action="save-stage" data-id="${order.id}">${icon('save')} Salvar etapa</button>`}${primary}</div></section><section class="card os-identification"><div class="detail-hero"><div class="detail-field"><label>Cliente / TAG</label><strong>${safe(client?.name)} · ${safe(eq?.tag)}</strong></div><div class="detail-field"><label>Equipamento</label><strong>${safe(equipmentDescription(eq))}</strong></div><div class="detail-field"><label>Entrada / Prazo</label><strong>${formatDate(order.entryDate)}<br>${formatDate(order.dueDate)}</strong></div><div class="detail-field"><label>Defeito informado</label><strong>${safe(order.defect)}</strong></div></div></section>${currentStageWorkspace(order)}${orderHistoryV5(order)}<section class="card handoff-card"><div class="card-head"><h2>Passagens entre equipes</h2></div><div class="card-body handoff-list">${handoffs||'<div class="empty">Nenhuma passagem registrada.</div>'}</div></section></div>`,'workshop');
  };

  function setReadinessButtonV202(button,ready,{disablePending=false,readyText='',pendingText=''}={}){
    if(!button)return;
    button.classList.toggle('btn-success',Boolean(ready));
    button.classList.toggle('btn-light',!ready);
    button.classList.toggle('readiness-pending-v202',!ready);
    if(disablePending)button.disabled=!ready;
    button.setAttribute('aria-disabled',!ready?'true':'false');
    if(ready)button.title='Condições atendidas: pronto para avançar';
    else button.title='Ainda existem condições pendentes';
    if(ready&&readyText)button.lastChild&&(button.lastChild.textContent=` ${readyText}`);
    if(!ready&&pendingText)button.lastChild&&(button.lastChild.textContent=` ${pendingText}`);
  }
  function refreshReadinessV202(order){
    if(!order)return;
    if(order.stage==='cotacao')collectQuotationV11(order);
    if(order.stage==='orcamento')collectBudgetV11(order);
    const requirements=stageRequirements(order),stageReady=requirements.length>0&&requirements.every(item=>item.ok);
    setReadinessButtonV202(document.querySelector(`[data-action="advance-stage"][data-id="${CSS.escape(String(order.id))}"]`),stageReady,{disablePending:true});
    if(order.stage==='orcamento'){
      const budget=ensureBudgetV11(order),readyForReview=budgetReadyForReviewV202(order);
      const submit=document.querySelector(`[data-action="submit-budget-review-v11"][data-id="${CSS.escape(String(order.id))}"]`);
      setReadinessButtonV202(submit,readyForReview,{disablePending:true,readyText:'Pronto: enviar para revisão',pendingText:'Complete os dados para revisar'});
      const approve=document.querySelector(`[data-action="approve-budget-internal-v11"][data-id="${CSS.escape(String(order.id))}"]`);
      setReadinessButtonV202(approve,budget.status===BUDGET_STATUS_V11.REVIEW,{disablePending:true,readyText:'Pronto: aprovar internamente',pendingText:'Aguardando revisão interna'});
      const send=document.querySelector(`[data-action="send-budget-client-v11"][data-id="${CSS.escape(String(order.id))}"]`);
      setReadinessButtonV202(send,budget.status===BUDGET_STATUS_V11.INTERNAL_APPROVED,{disablePending:true,readyText:'Pronto: enviar ao cliente',pendingText:'Aguardando aprovação interna'});
    }
  }
  function refreshCurrentOrderReadinessV202(){
    const {route,param}=parseRoute();if(route!=='order'||!param)return;refreshReadinessV202(getOrder(param));
  }
  document.addEventListener('input',event=>{
    if(event.target.matches('#quotation-responsible-v11,#quotation-notes-v11,#budget-billing-type-v11,#budget-scope-v11,#budget-parts-markup-v11,#budget-labor-v11,#budget-third-party-v11,#budget-freight-v11,#budget-other-v11,#budget-tax-v11,#budget-discount-v11,#budget-payment-v11,#budget-execution-v11,#budget-warranty-v11,#budget-valid-v11,#budget-recipient-v11,#budget-notes-v11'))setTimeout(refreshCurrentOrderReadinessV202,0);
  });
  document.addEventListener('change',event=>{
    if(event.target.matches('input,select,textarea'))setTimeout(refreshCurrentOrderReadinessV202,0);
  },true);

  function autoGrowTextareaV202(el){
    if(!(el instanceof HTMLTextAreaElement))return;el.style.height='auto';const h=Math.min(Math.max(el.scrollHeight,96),360);el.style.height=`${h}px`;el.style.overflowY=el.scrollHeight>360?'auto':'hidden';
  }
  function scrollContainerForV202(target){
    let node=target?.parentElement;
    while(node&&node!==document.body){
      const style=getComputedStyle(node);
      if(/auto|scroll/.test(style.overflowY)&&node.scrollHeight>node.clientHeight+8)return node;
      node=node.parentElement;
    }
    return document.scrollingElement||document.documentElement;
  }
  function focusVisibleAboveKeyboardV202(target){
    if(!target?.matches?.('input,select,textarea,[contenteditable="true"]'))return;
    if(target instanceof HTMLTextAreaElement)autoGrowTextareaV202(target);
    setTimeout(()=>{
      try{target.scrollIntoView({behavior:'smooth',block:'center',inline:'nearest'});}catch{}
      setTimeout(()=>{
        const vv=window.visualViewport,rect=target.getBoundingClientRect();
        const top=(vv?.offsetTop||0)+68;
        const bottom=(vv?.offsetTop||0)+(vv?.height||window.innerHeight)-92;
        let delta=0;
        if(rect.bottom>bottom)delta=rect.bottom-bottom+18;
        else if(rect.top<top)delta=rect.top-top-18;
        if(Math.abs(delta)>2){
          const scroller=scrollContainerForV202(target);
          if(scroller===document.scrollingElement||scroller===document.documentElement)window.scrollBy({top:delta,behavior:'smooth'});
          else scroller.scrollBy({top:delta,behavior:'smooth'});
        }
      },120);
    },120);
  }
  function updateVisualViewportV202(){
    const vv=window.visualViewport;
    const visibleHeight=vv?.height||window.innerHeight;
    const offsetTop=vv?.offsetTop||0;
    document.documentElement.style.setProperty('--ar7-visible-height-v202',`${visibleHeight}px`);
    const keyboard=Math.max(0,window.innerHeight-visibleHeight-offsetTop);
    document.documentElement.style.setProperty('--ar7-keyboard-v202',`${keyboard}px`);
    document.body.classList.toggle('keyboard-open-v202',keyboard>120);
  }
  function enhanceMobileUXV202(){
    document.querySelectorAll('textarea').forEach(autoGrowTextareaV202);
    updateVisualViewportV202();
  }
  document.addEventListener('click',event=>{
    const step=event.target.closest('.workflow-compact-v202 .workflow-step[data-flow-index]');
    if(!step)return;
    const container=step.closest('.workflow-card-v202');
    container?.querySelectorAll('.workflow-step').forEach(item=>item.classList.toggle('selected-v202',item===step));
    const detail=container?.querySelector('#workflow-selected-detail-v202');
    if(detail){
      detail.innerHTML=`<span>${safe(step.dataset.flowTeam||'Equipe')} · ${safe(step.dataset.flowState||'Etapa')}</span><strong>${safe(step.dataset.flowLabel||'')}</strong><small>${safe(step.dataset.flowShort||'')}</small>`;
    }
  },true);

  document.addEventListener('focusin',event=>focusVisibleAboveKeyboardV202(event.target),true);
  document.addEventListener('input',event=>{if(event.target instanceof HTMLTextAreaElement)autoGrowTextareaV202(event.target);},true);
  window.visualViewport?.addEventListener('resize',updateVisualViewportV202);
  window.visualViewport?.addEventListener('scroll',updateVisualViewportV202);

  function photoPagesV202(items,orderNumber,title='Evidências fotográficas'){
    if(!items.length)return '';
    const pages=[];
    for(let index=0;index<items.length;index+=4)pages.push(items.slice(index,index+4));
    return pages.map((page,pageIndex)=>`<section class="report-page report-photo-page report-photo-page-v13 report-photo-page-v202"><div class="report-page-header"><img src="./assets/ar7-logo.png" alt="AR7"><div><span>RELATÓRIO TÉCNICO · OS ${safe(orderNumber)}</span><strong>${safe(title)}${pages.length>1?` · ${pageIndex+1}/${pages.length}`:''}</strong></div></div><div class="report-photo-grid report-photo-grid-v202 count-${page.length}">${page.map((item,index)=>{const photo=item.photo;return `<figure><span class="report-photo-stage-v202">${safe(item.group)}</span>${reportPhotoSvgV7(photo)}<figcaption><strong>${safe(photo.caption||`Foto ${pageIndex*4+index+1}`)}</strong><span>${photo.observation?safe(photo.observation):'Registro fotográfico sem observação técnica complementar.'}</span></figcaption></figure>`;}).join('')}</div><div class="report-standard-note">Registros fotográficos vinculados à OS, organizados em ordem de execução para reduzir páginas sem perder a rastreabilidade técnica.</div><div class="report-footer"><span>AR7 Elétrica</span><span>Evidências fotográficas</span></div></section>`).join('');
  }

  reportPhotoSection=function(title,photos,orderNumber){
    const items=(photos||[]).map(photo=>{const p=normalizePhotoV5(photo);p.observation=photoObservationV13(photo);return {group:title,photo:p};});
    return photoPagesV202(items,orderNumber,title);
  };

  function consolidatedReportPhotosV202(order){
    const groups=[
      ['Recebimento',order.photos?.before||[]],
      ['Diagnóstico e desmontagem',order.photos?.during||[]],
      ['Montagem',order.photos?.assembly||[]],
      ['Equipamento finalizado',order.photos?.after||[]]
    ];
    const items=[];
    groups.forEach(([group,photos])=>(photos||[]).forEach(photo=>{const p=normalizePhotoV5(photo);p.observation=photoObservationV13(photo);items.push({group,photo:p});}));
    return photoPagesV202(items,order.number,'Fotos do serviço');
  }

  const reportDocumentBeforeV202=reportDocumentV5;
  reportDocumentV5=function(order){
    const originalPhotoRenderer=reportPhotoSection;
    let base='';
    try{
      reportPhotoSection=()=>''; // evita uma página separada para cada etapa
      base=reportDocumentBeforeV202(order);
    }finally{
      reportPhotoSection=originalPhotoRenderer;
    }
    const photos=consolidatedReportPhotosV202(order);
    return base.replace(/\s*<\/div>\s*$/,`${photos}</div>`);
  };

  reportPageCount=function(order){
    const total=['before','during','assembly','after'].reduce((sum,key)=>sum+(order.photos?.[key]?.length||0),0);
    return 5+Math.ceil(total/4);
  };

  /* =========================
     AR7 V20.2.3 — relatório compacto + fotos separadas por etapa
     ========================= */
  function reportPhotoSectionV2021(title,photos,orderNumber){
    const normalized=(photos||[]).map(photo=>{
      const p=normalizePhotoV5(photo);
      p.observation=photoObservationV13(photo);
      return p;
    });
    if(!normalized.length)return '';
    const pages=[];
    for(let index=0;index<normalized.length;index+=4)pages.push(normalized.slice(index,index+4));
    return pages.map((page,pageIndex)=>`<section class="report-page report-photo-page report-photo-page-v13 report-photo-page-v202 report-photo-page-v2021" data-photo-group="${safe(title)}"><div class="report-page-header"><img src="./assets/ar7-logo.png" alt="AR7"><div><span>RELATÓRIO TÉCNICO · OS ${safe(orderNumber)}</span><strong>${safe(title)}${pages.length>1?` · página ${pageIndex+1}/${pages.length}`:''}</strong></div></div><div class="report-photo-group-summary-v2021"><span>ETAPA FOTOGRÁFICA</span><strong>${safe(title)}</strong><small>${normalized.length} registro(s) nesta etapa · esta página contém somente fotos deste conjunto</small></div><div class="report-photo-grid report-photo-grid-v202 report-photo-grid-v2021 count-${page.length}">${page.map((photo,index)=>`<figure>${reportPhotoSvgV7(photo)}<figcaption><strong>${safe(photo.caption||`Foto ${pageIndex*4+index+1}`)}</strong><span>${photo.observation?safe(photo.observation):'Registro fotográfico sem observação técnica complementar.'}</span></figcaption></figure>`).join('')}</div><div class="report-standard-note">Evidências da etapa <strong>${safe(title)}</strong>. Fotos de outras etapas são apresentadas em páginas próprias para preservar a sequência e a rastreabilidade do serviço.</div><div class="report-footer"><span>AR7 Elétrica</span><span>Evidências fotográficas · ${safe(title)}</span></div></section>`).join('');
  }

  reportPhotoSection=reportPhotoSectionV2021;

  function balancedTechnicalReportV203(order){
    const template=document.createElement('template');
    template.innerHTML=reportDocumentBeforeV202(order).trim();
    const root=template.content.querySelector('.report-document');
    if(!root)return template.innerHTML;
    root.classList.add('report-document-v2021','report-document-v203');

    let pages=[...root.querySelectorAll(':scope > .report-page')];
    const cover=pages[0]||null;
    const identification=pages[1]||null;
    const intervention=pages[2]||null;
    const components=pages[3]||null;
    const signatures=pages[4]||null;
    const texts=professionalReportTextV7(order);

    function footerAnchorV203(page){return page?.querySelector('.report-footer')||null;}
    function insertBeforeFooterV203(page,node){
      if(!page||!node)return;
      const footer=footerAnchorV203(page);
      if(footer)footer.before(node);else page.appendChild(node);
    }
    function moveSectionV203(section,target,beforeNode){
      if(!section||!target)return;
      if(beforeNode)beforeNode.before(section);else insertBeforeFooterV203(target,section);
      section.classList.add('report-balanced-section-v203');
    }

    // Equilíbrio das páginas técnicas: 1, 2 e 3 ficam juntos na identificação,
    // eliminando a página praticamente vazia do diagnóstico. Os itens 4, 5, 6 e 7
    // permanecem na página seguinte, porém dentro de um corpo flexível que distribui
    // o espaço vertical de forma uniforme em vez de empilhar tudo no topo.
    if(identification&&intervention){
      const sections=[...intervention.querySelectorAll(':scope > .report-text-section')];
      const sectionByNumber=number=>sections.find(section=>String(section.querySelector('h2')?.textContent||'').trim().startsWith(`${number}.`));
      const diagnosisSection=sectionByNumber(3)||sections[0]||null;
      const identificationNote=identification.querySelector('.report-standard-note');
      moveSectionV203(diagnosisSection,identification,identificationNote);

      const idTitle=identification.querySelector('.report-page-header strong');
      if(idTitle)idTitle.textContent='Identificação, critérios e diagnóstico';
      const interventionTitle=intervention.querySelector('.report-page-header strong');
      if(interventionTitle)interventionTitle.textContent='Serviços, testes e conclusão';
      identification.classList.add('report-compact-page-v2021','report-balanced-page-v203','report-identification-v203');
      intervention.classList.add('report-compact-page-v2021','report-balanced-page-v203','report-intervention-v203');

      const identificationSections=[...identification.querySelectorAll(':scope > .report-text-section')];
      const identificationBody=document.createElement('div');
      identificationBody.className='report-identification-body-v203';
      identificationSections.forEach(section=>identificationBody.appendChild(section));
      if(identificationNote)identificationBody.appendChild(identificationNote);
      const identificationFooter=identification.querySelector('.report-footer');
      if(identificationFooter)identificationFooter.before(identificationBody);else identification.appendChild(identificationBody);

      const remainingSections=[...intervention.querySelectorAll(':scope > .report-text-section')];
      if(remainingSections.length){
        const body=document.createElement('div');
        body.className='report-intervention-body-v203';
        const footer=intervention.querySelector('.report-footer');
        remainingSections.forEach(section=>body.appendChild(section));
        if(footer)footer.before(body);else intervention.appendChild(body);
      }
    }

    const partRows=(order.parts||[]).length;
    const measurementRows=(order.measurements||[]).length;
    const technicianSignatures=ensureSignaturesV9(order).technicians.length||1;

    function movePageBodyBeforeFooterV203(source,target,dividerClass='report-compact-divider-v2021'){
      if(!source||!target)return;
      const targetFooter=target.querySelector('.report-footer');
      const sourceHeader=source.querySelector('.report-page-header');
      const sourceFooter=source.querySelector('.report-footer');
      const moving=[...source.children].filter(node=>node!==sourceHeader&&node!==sourceFooter);
      const divider=document.createElement('div');divider.className=`${dividerClass} report-divider-v203`;
      if(targetFooter)targetFooter.before(divider);else target.appendChild(divider);
      moving.forEach(node=>targetFooter?targetFooter.before(node):target.appendChild(node));
      source.remove();
    }

    // Componentes e medições mantêm página própria. Assinaturas só compartilham
    // essa página em relatórios realmente curtos, evitando nomes/assinaturas
    // comprimidos ou sobrepostos no rodapé.
    const canMergeSignatures=Boolean(components&&signatures&&(partRows+measurementRows)<=5&&technicianSignatures<=2);
    if(components){
      components.classList.add('report-compact-page-v2021','report-balanced-page-v203','report-components-v203');
      const title=components.querySelector('.report-page-header strong');
      if(title)title.textContent=canMergeSignatures?'Componentes, medições e responsáveis':'Componentes, medições e resultados';
    }
    if(canMergeSignatures){
      movePageBodyBeforeFooterV203(signatures,components,'report-compact-divider-v2021 signatures-divider-v2021');
      components.classList.add('report-has-signatures-v2021','report-signature-safe-v203');
    }else if(signatures){
      signatures.classList.add('report-compact-page-v2021','report-balanced-page-v203','report-signature-safe-v203');
    }

    // Crédito discreto da empresa responsável pela plataforma, sem competir com
    // a identidade da AR7 nem com o conteúdo técnico do documento.
    const creditTarget=(canMergeSignatures?components:signatures)||components;
    if(creditTarget){
      const wrapper=document.createElement('div');
      wrapper.innerHTML=developerCreditV203('Plataforma de gestão e documentos');
      const credit=wrapper.firstElementChild;
      if(credit)insertBeforeFooterV203(creditTarget,credit);
    }

    pages=[...root.querySelectorAll(':scope > .report-page')];
    pages.forEach((page,index)=>page.dataset.pageNumber=String(index+1));
    return template.innerHTML;
  }

  reportDocumentV5=balancedTechnicalReportV203;

  reportPageCount=function(order){
    const photoPages=['before','during','assembly','after'].reduce((sum,key)=>sum+Math.ceil((order.photos?.[key]?.length||0)/4),0);
    const partRows=(order.parts||[]).length;
    const measurementRows=(order.measurements||[]).length;
    const technicianSignatures=ensureSignaturesV9(order).technicians.length||1;
    const signaturesShareComponents=(partRows+measurementRows)<=5&&technicianSignatures<=2;
    const textPages=signaturesShareComponents?4:5;
    return textPages+photoPages;
  };

  const shellBeforeV202=shell;
  shell=function(content,route,portal=false,portalClientId=''){
    let html=shellBeforeV202(content,route,portal,portalClientId);
    html=html.replace(/<small>v[^<]+<\/small>/g,`<small>v${APP_RELEASE}</small>`);
    html=html.replace(/<button class="top-icon" aria-label="Notificações">[\s\S]*?<\/button>/g,'');
    html=html.replace(/<button class="top-icon" aria-label="Ajuda">[\s\S]*?<\/button>/g,'');
    html=html.replace(/<button class="workspace">([\s\S]*?)\s*▾<\/button>/g,'<div class="workspace" role="status" aria-label="Ambiente atual">$1</div>');
    html=html.replace(/id="client-search"(?![^>]*aria-label)/g,'id="client-search" aria-label="Pesquisar cliente, contato ou cidade"');
    html=html.replace(/id="order-search"(?![^>]*aria-label)/g,'id="order-search" aria-label="Pesquisar ordem de serviço, cliente ou TAG"');
    html=html.replace(/id="order-stage-filter"(?![^>]*aria-label)/g,'id="order-stage-filter" aria-label="Filtrar ordens por etapa"');
    html=html.replace(/<button(?![^>]*\btype=)/g,'<button type="button"');
    return html;
  };

  const renderBeforeV202=render;
  render=function(options={}){renderBeforeV202(options);requestAnimationFrame(enhanceMobileUXV202);};

  render();
  initRemoteSyncV20();
})();
