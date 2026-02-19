import { useState } from "react";

const styles = {
  vars: {
    bg: "#0d0f14", surface: "#13161e", surface2: "#1a1e29",
    border: "#252a38", border2: "#2e3448",
    accent: "#00e5a0", accentDim: "rgba(0,229,160,0.12)",
    accent2: "#4d7cfe", text: "#e2e6f0",
    textMuted: "#6b748a", textDim: "#9aa3b8",
    warning: "#f5a623",
  }
};
const v = styles.vars;

const Toggle = ({ checked, onChange }) => {
  return (
    <div onClick={() => onChange(!checked)} style={{ cursor:"pointer", width:44, height:24, borderRadius:12, background: checked ? v.accent : v.surface2, border:`1px solid ${checked ? v.accent : v.border2}`, position:"relative", transition:"all 0.2s", flexShrink:0 }}>
      <div style={{ position:"absolute", top:3, left:3, width:16, height:16, borderRadius:"50%", background:"#fff", transition:"transform 0.2s", transform: checked ? "translateX(20px)" : "none" }} />
    </div>
  );
};

const SectionTitle = ({ children }) => (
  <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:v.textMuted, marginBottom:12, display:"flex", alignItems:"center", gap:8 }}>
    {children}
    <div style={{ flex:1, height:1, background:v.border }} />
  </div>
);

const Card = ({ children, style }) => (
  <div style={{ background:v.surface, border:`1px solid ${v.border}`, borderRadius:12, overflow:"hidden", ...style }}>{children}</div>
);

const Field = ({ label, hint, hintColor, children }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:6, flex:1 }}>
    {label && <label style={{ fontSize:12, fontWeight:600, color:v.textDim }}>{label}</label>}
    {children}
    {hint && <div style={{ fontSize:11, color: hintColor || v.textMuted }}>{hint}</div>}
  </div>
);

const Input = ({ type="text", value, placeholder, style }) => (
  <input type={type} defaultValue={value} placeholder={placeholder} style={{ padding:"9px 12px", background:v.surface2, border:`1px solid ${v.border2}`, borderRadius:8, color:v.text, fontSize:13, fontFamily:"monospace", ...style }} />
);

const Select = ({ options }) => (
  <select style={{ padding:"9px 12px", background:v.surface2, border:`1px solid ${v.border2}`, borderRadius:8, color:v.text, fontSize:13, appearance:"none", cursor:"pointer", width:"100%" }}>
    {options.map(o => <option key={o}>{o}</option>)}
  </select>
);

const BtnTest = ({ children, onClick, style }) => (
  <button onClick={onClick} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 16px", background:v.surface2, border:`1px solid ${v.border2}`, borderRadius:8, color:v.textDim, fontSize:12, fontWeight:600, cursor:"pointer", ...style }}>{children}</button>
);

const ParamRow = ({ name, desc, checked, onChange }) => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderBottom:`1px solid ${v.border}` }}>
    <div style={{ flex:1 }}>
      <div style={{ fontSize:13, fontWeight:600, color:v.text }}>{name}</div>
      <div style={{ fontSize:12, color:v.textMuted, marginTop:2 }}>{desc}</div>
    </div>
    <Toggle checked={checked} onChange={onChange} />
  </div>
);

const RangeField = ({ label, value, onChange, accentColor, hint }) => (
  <Field label={label} hint={hint}>
    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
      <input type="range" min={0} max={10} value={Math.round(value*10)} onChange={e => onChange(e.target.value/10)} style={{ flex:1, accentColor: accentColor || v.accent }} />
      <div style={{ width:50, padding:"4px 8px", background:v.surface2, border:`1px solid ${v.border2}`, borderRadius:6, textAlign:"center", fontFamily:"monospace", fontSize:13, color:v.text }}>{value.toFixed(1)}</div>
    </div>
  </Field>
);

const Accordion = ({ title, children, accentColor }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderTop:`1px solid ${v.border}` }}>
      <button onClick={() => setOpen(!open)} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 20px", cursor:"pointer", background:"transparent", border:"none", width:"100%", textAlign:"left", fontFamily:"inherit" }}>
        <div style={{ fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:v.textMuted, display:"flex", alignItems:"center", gap:8 }}>⚙️ Parâmetros de Geração</div>
        <div style={{ color:v.textMuted, fontSize:12, transition:"transform 0.2s", transform: open?"rotate(180deg)":"none" }}>▼</div>
      </button>
      {open && (
        <div style={{ borderTop:`1px solid ${v.border}`, padding:"16px 20px" }}>
          {children}
        </div>
      )}
    </div>
  );
};

const ProviderCard = ({ icon, name, subtitle, apiKey, apiHint, models, defaultModel, modelHint, modelHintColor, lastTest, tempDefault, tokensDefault, accentColor }) => {
  const [temp, setTemp] = useState(tempDefault);
  return (
    <Card style={{ marginTop:12 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:`1px solid ${v.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:36, height:36, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, background:v.surface2, border:`1px solid ${v.border}` }}>{icon}</div>
          <div><div style={{ fontSize:14, fontWeight:600, color:v.text }}>{name}</div><div style={{ fontSize:12, color:v.textMuted }}>{subtitle}</div></div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 10px", borderRadius:20, background:"rgba(0,229,160,0.1)", color:v.accent, fontSize:11, fontWeight:600 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:"currentColor" }} /> Configurado
        </div>
      </div>
      <div style={{ padding:20, display:"flex", flexDirection:"column", gap:16 }}>
        <Field label="Chave de API" hint={apiHint}>
          <Input type="password" value={apiKey} />
        </Field>
        <div style={{ display:"flex", gap:16 }}>
          <Field label="Modelo Padrão" hint={modelHint} hintColor={modelHintColor}>
            <Select options={models} />
          </Field>
          <Field style={{ maxWidth:140 }}>
            <label style={{ fontSize:12, color:"transparent" }}>.</label>
            <BtnTest style={{ height:38, justifyContent:"center" }}>↻ Atualizar</BtnTest>
          </Field>
        </div>
      </div>
      <Accordion accentColor={accentColor}>
        <div style={{ display:"flex", gap:16 }}>
          <RangeField label="Temperatura" value={temp} onChange={setTemp} accentColor={accentColor} hint="Criatividade (0.0 = determinística, 1.0 = criativa)" />
          <Field label="Max Tokens por Análise" hint="Limite de tokens por análise gerada">
            <Input type="number" value={tokensDefault} />
          </Field>
        </div>
      </Accordion>
      <div style={{ padding:"14px 20px", borderTop:`1px solid ${v.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <BtnTest>⚡ Testar Conexão</BtnTest>
        <span style={{ fontSize:11, color:v.textMuted }}>{lastTest}</span>
      </div>
    </Card>
  );
};

const ViewAgente = ({ onNavLLM }) => {
  const [pratica, setPratica] = useState(true);
  const [tecnica, setTecnica] = useState(false);
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:v.textMuted, marginBottom:20 }}>
        <span style={{ color:v.textDim }}>Inteligência Artificial</span>
        <span style={{ color:v.border2 }}>›</span>
        <span style={{ color:v.text }}>Agente de Análise</span>
      </div>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:32 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:700, color:v.text }}>Agente de Análise</div>
          <div style={{ fontSize:13, color:v.textMuted, marginTop:4 }}>Modo de geração das análises comportamentais</div>
        </div>
        <button style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 20px", background:v.accent, color:"#0d0f14", border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer" }}>💾 Salvar Alterações</button>
      </div>

      <div style={{ marginBottom:28 }}>
        <SectionTitle>Modo de Análise</SectionTitle>
        <Card>
          <ParamRow name="Gerar Análise Prática (Recrutador)" desc="Linguagem simples, foco em ações práticas para uso no dia a dia do recrutador" checked={pratica} onChange={setPratica} />
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px" }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:600, color:v.text }}>Gerar Análise Técnica (Admin)</div>
              <div style={{ fontSize:12, color:v.textMuted, marginTop:2 }}>Linguagem técnica com fundamentação científica para análise aprofundada</div>
            </div>
            <Toggle checked={tecnica} onChange={setTecnica} />
          </div>
        </Card>
      </div>

      <div style={{ background:v.accentDim, border:"1px solid rgba(0,229,160,0.25)", borderRadius:10, padding:"14px 18px", display:"flex", gap:12, alignItems:"flex-start", fontSize:12, color:v.textDim }}>
        <span style={{ fontSize:16 }}>💡</span>
        <div>Ativação do agente, chaves de API e parâmetros de geração estão em <strong style={{ color:v.accent, cursor:"pointer" }} onClick={onNavLLM}>Integrações → Provedores LLM</strong>.</div>
      </div>
    </div>
  );
};

const ViewLLMs = () => {
  const [agenteAtivo, setAgenteAtivo] = useState(true);
  const [consumoView, setConsumoView] = useState("consolidado");

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:v.textMuted, marginBottom:20 }}>
        <span style={{ color:v.textDim }}>Integrações</span>
        <span style={{ color:v.border2 }}>›</span>
        <span style={{ color:v.text }}>Provedores LLM</span>
      </div>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:32 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:700, color:v.text }}>Provedores LLM</div>
          <div style={{ fontSize:13, color:v.textMuted, marginTop:4 }}>Gerencie as chaves de API e configurações dos modelos de linguagem</div>
        </div>
        <button style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 20px", background:v.accent, color:"#0d0f14", border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer" }}>💾 Salvar Configurações</button>
      </div>

      {/* ATIVAR AGENTE */}
      <Card style={{ marginBottom:28, padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:24 }}>
        <div>
          <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>Ativar Agente IA</div>
          <div style={{ fontSize:12, color:v.textMuted }}>Habilita análise inteligente dos resultados Gauge-Pro em toda a plataforma</div>
        </div>
        <Toggle checked={agenteAtivo} onChange={setAgenteAtivo} />
      </Card>

      {/* CONSUMO */}
      <div style={{ marginBottom:28 }}>
        <SectionTitle>Consumo</SectionTitle>
        <Card>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderBottom:`1px solid ${v.border}` }}>
            <div>
              <div style={{ fontSize:14, fontWeight:600 }}>Consumo Mensal</div>
              <div style={{ fontSize:11, color:v.textMuted, marginTop:2 }}>Fevereiro 2025 · Provedor ativo: <strong style={{ color:v.accent }}>Anthropic</strong></div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ display:"flex", background:v.surface2, border:`1px solid ${v.border}`, borderRadius:8, padding:3, gap:2 }}>
                {["consolidado","breakdown"].map(view => (
                  <button key={view} onClick={() => setConsumoView(view)} style={{ padding:"5px 14px", borderRadius:6, fontSize:11, fontWeight:600, cursor:"pointer", border: consumoView===view ? `1px solid ${v.border2}` : "1px solid transparent", background: consumoView===view ? v.surface : "transparent", color: consumoView===view ? v.text : v.textMuted, transition:"all 0.15s" }}>
                    {view === "consolidado" ? "Consolidado" : "Por Provedor"}
                  </button>
                ))}
              </div>
              <div style={{ width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", background:v.surface2, border:`1px solid ${v.border}`, borderRadius:6, color:v.textMuted, cursor:"pointer" }}>↻</div>
            </div>
          </div>

          {consumoView === "consolidado" ? (
            <>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", borderBottom:`1px solid ${v.border}` }}>
                {[["6","chamadas","Total de requisições"],["5.240","tokens","Tokens consumidos"],["R$ 0,12","","Custo estimado"]].map(([val,unit,label]) => (
                  <div key={label} style={{ padding:"16px 20px", borderRight:`1px solid ${v.border}` }}>
                    <div style={{ fontSize:24, fontWeight:700, color:v.text, marginBottom:2 }}>{val} <span style={{ fontSize:13, color:v.textMuted, fontWeight:400 }}>{unit}</span></div>
                    <div style={{ fontSize:11, color:v.textMuted }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding:"14px 20px", borderBottom:`1px solid ${v.border}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:v.textMuted, marginBottom:8 }}><span>6 de 100 chamadas</span><span>6%</span></div>
                <div style={{ height:6, background:v.surface2, borderRadius:10, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:"6%", borderRadius:10, background:`linear-gradient(90deg, ${v.accent}, ${v.accent2})` }} />
                </div>
              </div>
              <div style={{ padding:"14px 20px" }}>
                <div style={{ fontSize:11, fontWeight:700, color:v.textMuted, marginBottom:12, textTransform:"uppercase", letterSpacing:"0.08em" }}>Histórico Semanal</div>
                {[["11/02 – 18/02","4 chamadas","3.940 tokens","R$ 0,08"],["04/02 – 11/02","2 chamadas","1.300 tokens","R$ 0,04"],["28/01 – 04/02","0 chamadas","—","R$ 0,00"]].map(([period,calls,tokens,cost]) => (
                  <div key={period} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${v.border}`, fontSize:12 }}>
                    <div style={{ color:v.textDim }}>{period}</div>
                    <div style={{ fontWeight:600, color: calls==="0 chamadas" ? v.textMuted : v.text }}>{calls}</div>
                    <div style={{ color:v.textMuted, fontFamily:"monospace", fontSize:11 }}>{tokens}</div>
                    <div style={{ color:v.textMuted, fontFamily:"monospace", fontSize:11, minWidth:60, textAlign:"right" }}>{cost}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", borderBottom:`1px solid ${v.border}` }}>
                {[{name:"Anthropic",color:v.accent,calls:4,tokens:"3.940",cost:"R$ 0,08",pct:"67%"},{name:"OpenAI",color:v.accent2,calls:2,tokens:"1.300",cost:"R$ 0,04",pct:"33%"}].map(p => (
                  <div key={p.name} style={{ padding:"16px 20px", borderRight:`1px solid ${v.border}` }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, fontWeight:700, color:v.text, marginBottom:12 }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:p.color }} /> {p.name}
                    </div>
                    {[["Chamadas",p.calls],["Tokens",p.tokens],["Custo est.",p.cost]].map(([l,val]) => (
                      <div key={l} style={{ display:"flex", justifyContent:"space-between", fontSize:12, padding:"4px 0" }}>
                        <span style={{ color:v.textMuted }}>{l}</span>
                        <span style={{ color:v.text, fontFamily:"monospace", fontSize:11 }}>{val}</span>
                      </div>
                    ))}
                    <div style={{ height:4, background:v.surface2, borderRadius:10, marginTop:10 }}>
                      <div style={{ height:"100%", width:p.pct, borderRadius:10, background:p.color }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding:"14px 20px" }}>
                <div style={{ fontSize:11, fontWeight:700, color:v.textMuted, marginBottom:12, textTransform:"uppercase", letterSpacing:"0.08em" }}>Histórico Semanal · Por Provedor</div>
                {[["11/02 – 18/02","4","0","R$ 0,08"],["04/02 – 11/02","0","2","R$ 0,04"]].map(([period,ant,oai,cost]) => (
                  <div key={period} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${v.border}`, fontSize:12 }}>
                    <div style={{ color:v.textDim, minWidth:130 }}>{period}</div>
                    <div style={{ display:"flex", gap:16, fontSize:11 }}>
                      <span style={{ color:v.accent }}>Anthropic: {ant} calls</span>
                      <span style={{ color:v.accent2 }}>OpenAI: {oai} calls</span>
                    </div>
                    <div style={{ color:v.textMuted, fontFamily:"monospace", fontSize:11 }}>{cost}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* PROVEDOR PADRÃO */}
      <div style={{ marginBottom:28 }}>
        <SectionTitle>Provedor Padrão</SectionTitle>
        <Card>
          <div style={{ padding:20, display:"flex", alignItems:"center", justifyContent:"space-between", gap:24 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:4 }}>Provedor de LLM utilizado nas funcionalidades de IA</div>
              <div style={{ fontSize:12, color:v.textMuted, lineHeight:1.5 }}>Todas as chamadas de IA usarão o provedor selecionado. Ambos podem ser configurados simultaneamente.</div>
            </div>
            <div style={{ minWidth:200 }}>
              <Select options={["Anthropic (Claude)","OpenAI (GPT)"]} />
            </div>
          </div>
        </Card>
      </div>

      {/* PROVEDORES */}
      <div style={{ marginBottom:28 }}>
        <SectionTitle>Provedores Configurados</SectionTitle>
        <ProviderCard
          icon="🔷" name="Anthropic" subtitle="Família Claude · claude-sonnet-4-6, claude-haiku-4-5…"
          apiKey="sk-ant-api03-xxxxxxxxxxxx" apiHint="Chave salva: sk-ant-...nwAA · Deixe vazio para manter a atual"
          models={["Claude Sonnet 4.6","Claude Haiku 4.5","Claude Opus 4.6"]}
          modelHint="⚠ Modelo indisponível — verifique sua chave" modelHintColor={v.warning}
          lastTest="Último teste: 18/02/2025 às 14:32"
          tempDefault={0.7} tokensDefault="2000" accentColor={v.accent}
        />
        <ProviderCard
          icon="🟢" name="OpenAI" subtitle="Família GPT · gpt-4o, gpt-4o-mini, gpt-5…"
          apiKey="sk-proj-xxxxxxxxxxxx" apiHint="Chave salva: sk-...CUwA · Deixe vazio para manter a atual"
          models={["GPT-5.2","GPT-4o","GPT-4o mini"]}
          modelHint="51 modelos disponíveis" modelHintColor={v.textMuted}
          lastTest="Nunca testado"
          tempDefault={0.8} tokensDefault="1500" accentColor={v.accent2}
        />
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState("agente");

  const navItem = (id, label, indent=true) => (
    <div onClick={() => setView(id)} style={{ padding: indent ? "7px 16px 7px 28px" : "7px 16px", fontSize:13, color: view===id ? v.accent : v.textDim, background: view===id ? v.accentDim : "transparent", cursor:"pointer", position:"relative", borderLeft: view===id ? `3px solid ${v.accent}` : "3px solid transparent", transition:"all 0.15s" }}>
      {label}
    </div>
  );

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:"system-ui, sans-serif", background:v.bg, color:v.text, overflow:"hidden" }}>
      {/* SIDEBAR */}
      <div style={{ width:220, minWidth:220, background:v.surface, borderRight:`1px solid ${v.border}`, overflowY:"auto", padding:"16px 0" }}>
        <div style={{ margin:"0 12px 16px", padding:"8px 12px", background:v.surface2, border:`1px solid ${v.border}`, borderRadius:8, color:v.textMuted, fontSize:12 }}>🔍 Buscar configuração...</div>

        {[["⚙️ GERAL",[["","Dados da Plataforma"],["","Identidade Visual"],["","Preferências Regionais"]]],
          ["🤖 INTELIGÊNCIA ARTIFICIAL",[["","Gauge-Pro"],["","Matching"],["","Análise Comportamental"],["agente","Agente de Análise"]]],
          ["🎮 GAMIFICAÇÃO",[["","Badges e Níveis"]]],
          ["🔗 INTEGRAÇÕES",[["","APIs Externas"],["","Webhooks"],["","Stripe"],["llms","Provedores LLM"]]],
          ["👥 USUÁRIOS & PERMISSÕES",[]],
          ["📊 RELATÓRIOS",[]],
          ["🛠 SISTEMA",[["","Manutenção"],["","Logs"],["","Segurança"]]]
        ].map(([group, items]) => (
          <div key={group} style={{ marginBottom:4 }}>
            <div style={{ padding:"8px 16px", fontSize:11, fontWeight:700, color:v.textMuted, textTransform:"uppercase", letterSpacing:"0.08em" }}>{group}</div>
            {items.map(([id, label]) => (
              <div key={label} onClick={() => id && setView(id)} style={{ padding:"7px 16px 7px 28px", fontSize:13, color: id && view===id ? v.accent : v.textDim, background: id && view===id ? v.accentDim : "transparent", cursor: id ? "pointer" : "default", borderLeft: id && view===id ? `3px solid ${v.accent}` : "3px solid transparent" }}>
                {label}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* MAIN */}
      <div style={{ flex:1, overflowY:"auto", padding:"32px 40px", maxWidth:900 }}>
        {view === "agente" ? <ViewAgente onNavLLM={() => setView("llms")} /> : <ViewLLMs />}
      </div>

      {/* DEMO BADGE */}
      <div style={{ position:"fixed", bottom:20, left:"50%", transform:"translateX(-50%)", background:v.surface2, border:`1px solid ${v.border2}`, padding:"10px 20px", borderRadius:20, fontSize:12, color:v.textMuted, display:"flex", alignItems:"center", gap:8, zIndex:99 }}>
        <div style={{ width:8, height:8, borderRadius:"50%", background:v.accent, animation:"pulse 2s infinite" }} />
        Mockup interativo — navegue pelo menu lateral
      </div>
    </div>
  );
}
