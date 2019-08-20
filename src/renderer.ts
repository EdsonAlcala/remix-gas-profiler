export const getCostsColumn = gasPerLineCost => {
  let result = ''
  gasPerLineCost.forEach(item => {
    const currentCell =
      item.gasCost > 0
        ? `<span class='gas-amount'>${item.gasCost}</span>`
        : `<span class='empty'>0</span>`
    result += currentCell
  })
  return result
}

export const getCodeWithGasCosts = (costsColumn, originalSourceCode) => `
<table><tbody>
  <tr>
    <td class="gas-costs">
      ${costsColumn}
    </td>
    <td>
        <pre class="prettyprint lang-js">${originalSourceCode}</pre>
    </td>
  </tr>
</tbody></table>
`

export const transactionHeader = ({
  hash,
  transactionCost,
  executionCost,
  contractAddress,
  to,
}) => `
        <li class="custom list-group-item d-print-flex">
          <h6>Transaction hash</h6>
          <p class="badge badge-light">${hash}</p>
          <h6> Contract address </h6>
          <p class="badge badge-light">${contractAddress || to}</p>
          <h6>Transaction cost</h6>
          <p class="badge badge-light">${transactionCost}</p>
          <h6>Execution cost</h6>
          <p class="badge badge-light">${executionCost}</p>
        </li>
    `
