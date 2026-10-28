# Resume un archivo .jtl de JMeter por petición (muestras, error, promedio, P90, P95) en filas Markdown.
# Uso: awk -f docs/tabla-jtl.awk ruta/al/archivo.jtl
BEGIN { FPAT = "([^,]*)|(\"[^\"]*\")" }
NR > 1 && $3 !~ /^(Preparación|Limpieza)/ {
  l = $3; n[l]++; t[l] += $2; if ($8 == "false") e[l]++; v[l][n[l]] = $2 + 0
  N++; T += $2; if ($8 == "false") E++; V[N] = $2 + 0
}
function pct(arr, cnt, p,   k) { k = int(cnt * p + 0.999999); if (k < 1) k = 1; return arr[k] }
END {
  PROCINFO["sorted_in"] = "@ind_str_asc"
  for (l in n) {
    asort(v[l], s)
    printf "| %s | %d | %.2f %% | %.0f | %d | %d |\n", l, n[l], 100 * e[l] / n[l], t[l] / n[l], pct(s, n[l], 0.90), pct(s, n[l], 0.95)
    delete s
  }
  asort(V, S)
  printf "| **Total** | %d | %.2f %% | %.0f | %d | %d |\n", N, 100 * E / N, T / N, pct(S, N, 0.90), pct(S, N, 0.95)
}
