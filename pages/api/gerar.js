{aberto && (
                    <div style={{ padding: '0 14px 14px' }}>
                      <div style={{ height: '1px', background: 'linear-gradient(to right, #C8FF0030, transparent)', marginBottom: '12px' }} />
                      <p style={{ fontSize: '12px', color: '#ffffffaa', lineHeight: '1.75', margin: '0 0 14px' }}>{c.insight}</p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={function() { window.open('https://www.youtube.com/results?search_query=' + encodeURIComponent(c.buscaYoutube || c.marca + ' ' + c.campanha), '_blank'); }}
                          onMouseEnter={function(e) { e.currentTarget.style.background = '#C8FF00'; e.currentTarget.style.color = '#000'; }}
                          onMouseLeave={function(e) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#C8FF00'; }}
                          style={{ flex: 1, padding: '7px 10px', borderRadius: '8px', background: 'transparent', border: '1px solid #C8FF00', color: '#C8FF00', cursor: 'pointer', fontSize: '11px', fontWeight: '700', fontFamily: 'inherit', transition: 'all 0.15s', textAlign: 'center' }}>
                          YouTube ↗
                        </button>
                        <button onClick={function() { window.open('https://www.google.com/search?q=' + encodeURIComponent(c.buscaGoogle || c.marca + ' ' + c.campanha), '_blank'); }}
                          onMouseEnter={function(e) { e.currentTarget.style.background = '#ffffff15'; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={function(e) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ffffff50'; }}
                          style={{ flex: 1, padding: '7px 10px', borderRadius: '8px', background: 'transparent', border: '1px solid #ffffff20', color: '#ffffff50', cursor: 'pointer', fontSize: '11px', fontWeight: '700', fontFamily: 'inherit', transition: 'all 0.15s', textAlign: 'center' }}>
                          Google ↗
                        </button>
                      </div>
                    </div>
                  )}
