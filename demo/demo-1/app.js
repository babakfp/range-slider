const shopPriceFilter =_=> {
  const rangeSlider = new RangeSlider(document.getElementById('js-filter'), {
    min: 0,
    max: 1000,
    start: 100,
    end: 300,
    overlap: true
  })
  const minValue = document.getElementById('js-filter-value-min')
  const maxValue = document.getElementById('js-filter-value-max')
  rangeSlider.subscribe('moving', (data) => {
    minValue.innerHTML = Math.round(data.left - (data.left % 10))
    maxValue.innerHTML = Math.round(data.right - (data.right % 10))
  })
  minValue.innerHTML = Math.round(rangeSlider.getInfo().left - (rangeSlider.getInfo().left % 10))
  maxValue.innerHTML = Math.round(rangeSlider.getInfo().right - (rangeSlider.getInfo().right % 10))
}
shopPriceFilter()