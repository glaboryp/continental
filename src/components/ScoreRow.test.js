import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ScoreRow from './ScoreRow.vue'

const player = { id: 'ana', name: 'Ana' }

describe('ScoreRow', () => {
  it('filters non-digit input before emitting an update', async () => {
    const wrapper = mount(ScoreRow, {
      props: { player, place: 1, total: 12 },
    })

    await wrapper.get('.score-input').setValue('1x2')

    expect(wrapper.get('.score-input').element.value).toBe('12')
    expect(wrapper.emitted('update')).toEqual([['12']])
  })

  it('emits an unchanged numeric score', async () => {
    const wrapper = mount(ScoreRow, {
      props: { player, place: 1, total: 12 },
    })

    await wrapper.get('.score-input').setValue('25')

    expect(wrapper.emitted('update')).toEqual([['25']])
  })

  it('keeps a leading minus sign so negative scores can be entered', async () => {
    const wrapper = mount(ScoreRow, {
      props: { player, place: 1, total: 12 },
    })

    await wrapper.get('.score-input').setValue('-5')

    expect(wrapper.get('.score-input').element.value).toBe('-5')
    expect(wrapper.emitted('update')).toEqual([['-5']])
  })

  it('drops minus signs that are not at the start', async () => {
    const wrapper = mount(ScoreRow, {
      props: { player, place: 1, total: 12 },
    })

    await wrapper.get('.score-input').setValue('1-2-')

    expect(wrapper.get('.score-input').element.value).toBe('12')
    expect(wrapper.emitted('update')).toEqual([['12']])
  })

  it('keeps a lone minus visible while the score is still empty', async () => {
    const wrapper = mount(ScoreRow, {
      props: { player, place: 1, total: 12, value: 5 },
    })

    await wrapper.get('.score-input').setValue('-')
    await wrapper.setProps({ value: undefined })

    expect(wrapper.get('.score-input').element.value).toBe('-')
  })

  it('emits advance when Enter is pressed in the score input', async () => {
    const wrapper = mount(ScoreRow, {
      props: { player, place: 1, total: 12 },
    })

    await wrapper.get('.score-input').trigger('keydown.enter')

    expect(wrapper.emitted('advance')).toHaveLength(1)
  })

  it('marks the row as being written while its input has focus', async () => {
    const wrapper = mount(ScoreRow, {
      attachTo: document.body,
      props: { player, place: 1, total: 12 },
    })

    await wrapper.get('.score-input').trigger('focusin')
    expect(wrapper.classes()).toContain('is-writing')

    await wrapper.get('.score-input').trigger('focusout')
    expect(wrapper.classes()).not.toContain('is-writing')

    wrapper.unmount()
  })
})
