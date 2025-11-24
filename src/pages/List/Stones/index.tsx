import React, { memo, useEffect, useRef, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Select,
  InputNumber,
  Radio,
  Button,
  Table,
  Tag,
  Image,
  Dialog,
  Form,
  Input,
  Textarea,
  Switch,
  MessagePlugin,
} from 'tdesign-react';
import classnames from 'classnames';
import { useAppDispatch, useAppSelector } from 'modules/store';
import {
  selectStoneList,
  fetchStoneFilters,
  fetchStoneList,
  setFilterValues,
  setPagination,
  resetStoneListState,
} from 'modules/backend/stoneList';
import type { StoneListFilterState } from 'modules/backend/stoneList';
import {
  createStone,
  updateStone,
  deleteStone,
  StoneItem,
  StonePayload,
  StoneDetail,
  StoneImageDetail,
  StoneExternalDataPayload,
  ExternalStoneSyncResponse,
  syncExternalStones,
  getStoneDetail,
} from 'services/backend';
import CommonStyle from 'styles/common.module.less';
import style from './index.module.less';

const { Option } = Select;
const { FormItem } = Form;
type MediaFilterKey = 'hasImages' | 'hasVideo';

const StoneListPage = () => {
  const dispatch = useAppDispatch();
  const { filters, list, loading, page, pageSize, total, filterValues } = useAppSelector(selectStoneList);
  const [formVisible, setFormVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<StoneItem | null>(null);

  const [images, setImages] = useState<StoneImageDetail[]>([]);
  const [syncDialogVisible, setSyncDialogVisible] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<ExternalStoneSyncResponse | null>(null);

  const formRef = useRef<any>();
  const syncFormRef = useRef<any>();

  const normalizeInput = (value?: string) => {
    if (!value) return undefined;
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  };

  const handleMediaFilterToggle = (key: MediaFilterKey, value: boolean) => {
    const payload: Partial<StoneListFilterState> = {
      [key]: value ? true : undefined,
    };
    dispatch(setFilterValues(payload));
    dispatch(
      setPagination({
        page: 1,
        pageSize,
      }),
    );
    dispatch(fetchStoneList());
  };

  useEffect(() => {
    dispatch(fetchStoneFilters());
    dispatch(fetchStoneList());
    return () => {
      dispatch(resetStoneListState());
    };
  }, []);

  const handleAdd = () => {
    setEditing(null);
    setImages([]);
    setFormVisible(true);
  };

  const handleEdit = async (record: StoneItem) => {
    setEditing(record);
    setFormVisible(true);
    try {
      const detail: StoneDetail = await getStoneDetail(record.id);
      const detailImages = (detail.images || []).map((img, index) => ({
        ...img,
        sortOrder: typeof img.sortOrder === 'number' ? img.sortOrder : index,
        isPrimary: typeof img.isPrimary === 'boolean' ? img.isPrimary : index === 0,
      }));
      setImages(detailImages);
    } catch (e) {
      setImages([]);
      MessagePlugin.error('加载石头详情失败');
    }
  };

  const handleDelete = async (record: StoneItem) => {
    try {
      setSaving(true);
      await deleteStone(record.id);
      MessagePlugin.success('删除成功');
      dispatch(fetchStoneList());
    } catch (e) {
      MessagePlugin.error('删除失败');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenSyncDialog = () => {
    setSyncResult(null);
    setSyncDialogVisible(true);
  };

  const handleSyncClose = () => {
    setSyncDialogVisible(false);
    setSyncResult(null);
  };

  const handleSyncSubmit = async (ctx: any) => {
    if (ctx.validateResult !== true) return;
    const values = syncFormRef.current?.getFieldsValue?.(true) as any;
    const payload = {
      appid: values.appid?.trim() || undefined,
      secret: values.secret?.trim() || undefined,
      dSizeMin: values.dSizeMin,
      dSizeMax: values.dSizeMax,
      pageint: values.pageint,
      pagesize: values.pagesize,
    };
    try {
      setSyncLoading(true);
      const result = await syncExternalStones(payload);
      setSyncResult(result);
      MessagePlugin.success(`已导入 ${result.importedCount} 条石头`);
      dispatch(fetchStoneList());
    } catch (e) {
      MessagePlugin.error('同步失败');
    } finally {
      setSyncLoading(false);
    }
  };

  const handleAddImage = () => {
    setImages((prev) => {
      const nextIndex = prev.length;
      return [
        ...prev,
        {
          url: '',
          alt: '',
          badge: '',
          aspect: 'square',
          sortOrder: nextIndex,
          isPrimary: prev.length === 0,
        },
      ];
    });
  };

  const handleUpdateImage = (index: number, field: keyof StoneImageDetail, value: any) => {
    setImages((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: value,
      };
      return next;
    });
  };

  const handleDeleteImage = (index: number) => {
    setImages((prev) => {
      const next = prev
        .filter((_, i) => i !== index)
        .map((img, i) => ({
          ...img,
          sortOrder: i,
        }));
      if (next.length > 0 && !next.some((img) => img.isPrimary)) {
        next[0] = { ...next[0], isPrimary: true };
      }
      return next;
    });
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages((prev) => prev.map((img, i) => ({ ...img, isPrimary: i === index })));
  };

  const onSubmit = async (ctx: any) => {
    if (ctx.validateResult !== true) return;
    const values = formRef.current?.getFieldsValue?.(true) as any;

    const payload: StonePayload = {
      name: values.name,
      type: values.type,
      shapeCode: values.shapeCode,
      carat: Number(values.carat),
      colorCode: values.colorCode,
      clarityCode: values.clarityCode,
      cutCode: values.cutCode,
      certificateCode: values.certificateCode || undefined,
      ratio: Number(values.ratio),
      price: Number(values.price),
      currency: values.currency,
      isAvailable: values.isAvailable,
    };

    const normalizedImages = images
      .filter((img) => img.url)
      .map((img, index) => ({
        imageUrl: img.url,
        altText: img.alt || '',
        badge: img.badge || undefined,
        aspectRatio: img.aspect || 'square',
        sortOrder: typeof img.sortOrder === 'number' ? img.sortOrder : index,
        isPrimary: !!img.isPrimary,
      }));

    payload.images = normalizedImages;

    const externalData: StoneExternalDataPayload = {
      externalReportNo: normalizeInput(values.externalReportNo),
      externalDRef: normalizeInput(values.externalDRef),
      externalCertNo: normalizeInput(values.externalCertNo),
      externalRate:
        values.externalRate !== undefined && values.externalRate !== null
          ? Number(values.externalRate)
          : undefined,
      externalDiscount:
        values.externalDiscount !== undefined && values.externalDiscount !== null
          ? Number(values.externalDiscount)
          : undefined,
      externalLocation: normalizeInput(values.externalLocation),
      externalVideoUrl: normalizeInput(values.externalVideoUrl),
      externalRemark: normalizeInput(values.externalRemark),
      externalPolish: normalizeInput(values.externalPolish),
      externalSymmetry: normalizeInput(values.externalSymmetry),
      externalDepthPercent:
        values.externalDepthPercent !== undefined && values.externalDepthPercent !== null
          ? Number(values.externalDepthPercent)
          : undefined,
      externalTablePercent:
        values.externalTablePercent !== undefined && values.externalTablePercent !== null
          ? Number(values.externalTablePercent)
          : undefined,
      externalBrowness: normalizeInput(values.externalBrowness),
      externalEyeClean: normalizeInput(values.externalEyeClean),
    };

    if (Object.values(externalData).some((value) => value !== undefined)) {
      payload.externalData = externalData;
    }

    try {
      setSaving(true);
      if (editing) {
        await updateStone(editing.id, payload);
        MessagePlugin.success('更新成功');
      } else {
        await createStone(payload);
        MessagePlugin.success('创建成功');
      }
      setFormVisible(false);
      dispatch(fetchStoneList());
    } catch (e) {
      MessagePlugin.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      colKey: 'name',
      title: '名称',
      width: 160,
      align: 'left' as const,
    },
    {
      colKey: 'type',
      title: '类型',
      width: 100,
      cell({ row }: any) {
        return row.type === 'lab_grown' ? (
          <Tag theme='success' variant='light'>
            培育钻
          </Tag>
        ) : (
          <Tag theme='primary' variant='light'>
            天然钻
          </Tag>
        );
      },
    },
    {
      colKey: 'shape',
      title: '形状',
      width: 120,
    },
    {
      colKey: 'carat',
      title: '克拉',
      width: 100,
    },
    {
      colKey: 'color',
      title: '颜色',
      width: 100,
    },
    {
      colKey: 'clarity',
      title: '净度',
      width: 100,
    },
    {
      colKey: 'cut',
      title: '切工',
      width: 120,
    },
    {
      colKey: 'certificate',
      title: '证书',
      width: 120,
    },
    {
      colKey: 'externalInfo',
      title: '外部信息',
      width: 220,
      align: 'left' as const,
      cell({ row }: any) {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontWeight: 600 }}>
              {row.externalReportNo || row.externalDRef || '—'}
            </div>
            <div
              style={{
                fontSize: 12,
                color: '#6c6c6c',
              }}
            >
              {row.externalRate ? `${row.externalRate.toFixed(2)} USD` : '暂无价格'}
              {row.externalDiscount ? ` · ${row.externalDiscount}%` : ''}
            </div>
            <div style={{ fontSize: 12, color: '#6c6c6c' }}>
              {row.externalLocation || '未知地点'}
            </div>
          </div>
        );
      },
    },
    {
      colKey: 'price',
      title: '价格',
      width: 140,
      cell({ row }: any) {
        return `${row.price} ${row.currency || ''}`;
      },
    },
    {
      colKey: 'ratio',
      title: '比率',
      width: 100,
    },
    {
      colKey: 'op',
      title: '操作',
      width: 180,
      cell({ row }: { row: StoneItem }) {
        return (
          <>
            <Button theme='primary' variant='text' onClick={() => handleEdit(row)}>
              编辑
            </Button>
            <Button theme='danger' variant='text' onClick={() => handleDelete(row)}>
              删除
            </Button>
          </>
        );
      },
    },
  ];

  return (
    <div className={classnames(CommonStyle.pageWithPadding, CommonStyle.pageWithColor)}>
      <div className={style.toolBar}>
        <Row gutter={[24, 16]} align='middle'>
          <Col>
            <div className={style.filterItem}>
              <span style={{ marginRight: 8 }}>仅含图片</span>
              <Switch
                checked={Boolean(filterValues.hasImages)}
                size='small'
                onChange={(value) => handleMediaFilterToggle('hasImages', value)}
              />
            </div>
          </Col>
          <Col>
            <div className={style.filterItem}>
              <span style={{ marginRight: 8 }}>仅含视频</span>
              <Switch
                checked={Boolean(filterValues.hasVideo)}
                size='small'
                onChange={(value) => handleMediaFilterToggle('hasVideo', value)}
              />
            </div>
          </Col>
        </Row>
      </div>
      <Card
        style={{ marginTop: 16 }}
        title='石头列表'
        bordered={false}
        actions={
          <>
            <Button theme='default' onClick={handleOpenSyncDialog}>
              同步外部石头
            </Button>
            <Button theme='primary' onClick={handleAdd}>
              新增石头
            </Button>
          </>
        }
      >
        <Table
          rowKey='id'
          loading={loading}
          data={list}
          columns={columns}
          pagination={{
            pageSize,
            current: page,
            total,
            showJumper: true,
            onCurrentChange: (current, pageInfo) => {
              dispatch(
                setPagination({
                  page: current,
                  pageSize: pageInfo.pageSize,
                }),
              );
              dispatch(fetchStoneList());
            },
            onPageSizeChange: (size) => {
              dispatch(
                setPagination({
                  page: 1,
                  pageSize: size,
                }),
              );
              dispatch(fetchStoneList());
            },
          }}
        />
      </Card>

      <Dialog
        header='同步外部石头'
        visible={syncDialogVisible}
        confirmBtn={{ content: '拉取并导入', loading: syncLoading }}
        cancelBtn='取消'
        onClose={handleSyncClose}
        onConfirm={() => syncFormRef.current?.submit?.()}
        width='720px'
      >
        <Form
          ref={syncFormRef}
          labelWidth={120}
          colon
          onSubmit={handleSyncSubmit}
        >
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <FormItem label='最小石码' name='dSizeMin'>
                <InputNumber placeholder='0.5' min={0} step={0.01} />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label='最大石码' name='dSizeMax'>
                <InputNumber placeholder='2' min={0} step={0.01} />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label='页码' name='pageint' initialData={1}>
                <InputNumber min={1} step={1} />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label='每页条数' name='pagesize' initialData={10}>
                <InputNumber min={1} step={1} />
              </FormItem>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <FormItem label='App ID' name='appid'>
                <Input placeholder='可选，默认配置' clearable />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label='Secret' name='secret'>
                <Input placeholder='可选，默认配置' clearable />
              </FormItem>
            </Col>
          </Row>
        </Form>

        <div style={{ marginTop: 16 }}>
          {syncResult ? (
            <>
              <p style={{ margin: 0, fontSize: 12, color: '#7f7f7f' }}>
                本次导入 {syncResult.importedCount} 条，最近的几项：
              </p>
              <div
                style={{
                  marginTop: 8,
                  maxHeight: 240,
                  overflowY: 'auto',
                }}
              >
                {syncResult.list.map((item) => (
                  <div
                    key={item.externalId}
                    style={{
                      borderBottom: '1px dashed #e5e5e5',
                      padding: '8px 0',
                    }}
                  >
                    <p style={{ margin: 0, fontWeight: 600 }}>
                      {[
                        item.shape,
                        item.carat ? `${item.carat.toFixed(2)}ct` : null,
                        item.color,
                        item.clarity,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                    <p
                      style={{
                        margin: '4px 0 0',
                        fontSize: 12,
                        color: '#6c6c6c',
                      }}
                    >
                      折扣价：{item.rate ?? '-'} USD · 地点：{item.location ?? '未知'}
                    </p>
                    <p
                      style={{
                        margin: '2px 0 0',
                        fontSize: 12,
                        color: '#6c6c6c',
                      }}
                    >
                      报告号：{item.reportNo ?? 'N/A'} · 外部编号：{item.dRef ?? 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p style={{ margin: 0, fontSize: 12, color: '#7f7f7f' }}>
              支持调整参数后拉取真实石头数据，默认会使用后台配置的 AppID/Secret。
            </p>
          )}
        </div>
      </Dialog>

      <Dialog
        header={editing ? '编辑石头' : '新增石头'}
        visible={formVisible}
        confirmBtn={{ content: '保存', loading: saving }}
        cancelBtn='取消'
        onClose={() => setFormVisible(false)}
        onConfirm={() => formRef.current?.submit?.()}
        width='720px'
      >
        <Form ref={formRef} labelWidth={90} onSubmit={onSubmit} colon key={editing ? editing.id : 'new'}>
          <FormItem
            label='类型'
            name='type'
            initialData={editing?.type || 'lab_grown'}
            rules={[{ required: true, message: '请选择类型', type: 'error' }]}
          >
            <Radio.Group>
              <Radio.Button value='natural'>天然钻</Radio.Button>
              <Radio.Button value='lab_grown'>培育钻</Radio.Button>
            </Radio.Group>
          </FormItem>

          <FormItem
            label='名称'
            name='name'
            initialData={editing?.name}
            rules={[{ required: true, message: '请输入名称', type: 'error' }]}
          >
            <Input placeholder='请输入石头名称，如 Radiant 0.50ct' />
          </FormItem>

          <Row gutter={[16, 16]}>
            <Col span={6}>
              <FormItem
                label='形状'
                name='shapeCode'
                initialData={editing?.shape}
                rules={[{ required: true, message: '请选择形状', type: 'error' }]}
              >
                <Select placeholder='请选择形状'>
                  {filters?.shapes?.map((item) => (
                    <Option key={item.code} value={item.code} label={item.label} />
                  ))}
                </Select>
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label='颜色'
                name='colorCode'
                initialData={editing?.color}
                rules={[{ required: true, message: '请选择颜色', type: 'error' }]}
              >
                <Select placeholder='请选择颜色'>
                  {filters?.colors?.map((item) => (
                    <Option key={item.code} value={item.code} label={item.label} />
                  ))}
                </Select>
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label='净度'
                name='clarityCode'
                initialData={editing?.clarity}
                rules={[{ required: true, message: '请选择净度', type: 'error' }]}
              >
                <Select placeholder='请选择净度'>
                  {filters?.clarities?.map((item) => (
                    <Option key={item.code} value={item.code} label={item.label} />
                  ))}
                </Select>
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label='切工'
                name='cutCode'
                initialData={editing?.cut}
                rules={[{ required: true, message: '请选择切工', type: 'error' }]}
              >
                <Select placeholder='请选择切工'>
                  {filters?.cuts?.map((item) => (
                    <Option key={item.code} value={item.code} label={item.label} />
                  ))}
                </Select>
              </FormItem>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={6}>
              <FormItem
                label='克拉'
                name='carat'
                initialData={editing?.carat}
                rules={[{ required: true, message: '请输入克拉', type: 'error' }]}
              >
                <InputNumber min={0} />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label='比率'
                name='ratio'
                initialData={editing?.ratio}
                rules={[{ required: true, message: '请输入比率', type: 'error' }]}
              >
                <InputNumber min={0} />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label='价格' name='price' initialData={editing?.price}>
                <InputNumber min={0} />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label='币种' name='currency' initialData={editing?.currency || 'USD'}>
                <Input placeholder='例如 USD' />
              </FormItem>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={6}>
              <FormItem label='证书' name='certificateCode' initialData={editing?.certificate}>
                <Select clearable placeholder='请选择证书'>
                  {filters?.certificates?.map((item) => (
                    <Option key={item.code} value={item.code} label={item.label} />
                  ))}
                </Select>
              </FormItem>
            </Col>
          </Row>

          <div className={style.sectionTitle}>外部字段（可选）</div>
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <FormItem
                label='报告号'
                name='externalReportNo'
                initialData={editing?.externalReportNo}
              >
                <Input placeholder='675527487' />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label='外部编号'
                name='externalDRef'
                initialData={editing?.externalDRef}
              >
                <Input placeholder='sz067' />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label='证书号'
                name='externalCertNo'
                initialData={editing?.externalCertNo}
              >
                <Input placeholder='IGI 675527487' />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label='地点'
                name='externalLocation'
                initialData={editing?.externalLocation}
              >
                <Input placeholder='深圳' />
              </FormItem>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <FormItem
                label='视频链接'
                name='externalVideoUrl'
                initialData={editing?.externalVideoUrl}
              >
                <Input placeholder='https://example.com/video.mp4' />
              </FormItem>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <FormItem label='外部价格' name='externalRate' initialData={editing?.externalRate}>
                <InputNumber min={0} step={0.01} />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label='折扣'
                name='externalDiscount'
                initialData={editing?.externalDiscount}
              >
                <InputNumber min={0} step={0.01} />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label='抛光'
                name='externalPolish'
                initialData={editing?.externalPolish}
              >
                <Input placeholder='EX / VG' />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label='对称'
                name='externalSymmetry'
                initialData={editing?.externalSymmetry}
              >
                <Input placeholder='EX / VG' />
              </FormItem>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <FormItem
                label='纵深%'
                name='externalDepthPercent'
                initialData={editing?.externalDepthPercent}
              >
                <InputNumber min={0} step={0.01} />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label='台宽%'
                name='externalTablePercent'
                initialData={editing?.externalTablePercent}
              >
                <InputNumber min={0} step={0.01} />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label='肉眼净度'
                name='externalEyeClean'
                initialData={editing?.externalEyeClean}
              >
                <Input placeholder='Eye Clean' />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label='咖'
                name='externalBrowness'
                initialData={editing?.externalBrowness}
              >
                <Input placeholder='Browness' />
              </FormItem>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <FormItem
                label='备注'
                name='externalRemark'
                initialData={editing?.externalRemark}
              >
                <Textarea placeholder='其他备注' rows={2} autoSize />
              </FormItem>
            </Col>
          </Row>

          <FormItem label='是否可用' name='isAvailable' initialData={editing?.isAvailable ?? true}>
            <Switch />
          </FormItem>

          <FormItem label='图片管理'>
            <div style={{ width: '100%' }}>
              {images.length === 0 ? (
                <div style={{ marginBottom: 12, color: '#999' }}>暂无图片，请点击下方“新增图片”按钮添加。</div>
              ) : (
                images.map((img, index) => (
                  <Row
                    key={index}
                    gutter={[16, 8]}
                    style={{
                      marginBottom: 12,
                      paddingBottom: 12,
                      borderBottom: '1px dashed #eee',
                    }}
                  >
                    <Col span={3}>
                      {img.url ? (
                        <Image src={img.url} style={{ width: '100%', height: 80, objectFit: 'cover' }} fit='cover' />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: 80,
                            border: '1px dashed #ddd',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#bbb',
                            fontSize: 12,
                          }}
                        >
                          无预览
                        </div>
                      )}
                    </Col>
                    <Col span={5}>
                      <Input
                        value={img.url}
                        placeholder='图片 URL'
                        onChange={(value) => handleUpdateImage(index, 'url', value)}
                      />
                    </Col>
                    <Col span={4}>
                      <Input
                        value={img.alt}
                        placeholder='ALT 文本'
                        onChange={(value) => handleUpdateImage(index, 'alt', value)}
                      />
                    </Col>
                    <Col span={4}>
                      <Input
                        value={img.badge}
                        placeholder='角标，如 NEW'
                        onChange={(value) => handleUpdateImage(index, 'badge', value)}
                      />
                    </Col>
                    <Col span={3}>
                      <Select
                        value={img.aspect || 'square'}
                        onChange={(value) => handleUpdateImage(index, 'aspect', value as StoneImageDetail['aspect'])}
                      >
                        <Option value='square' label='方形' />
                        <Option value='portrait' label='竖图' />
                      </Select>
                    </Col>
                    <Col span={2}>
                      <InputNumber
                        min={0}
                        value={typeof img.sortOrder === 'number' ? img.sortOrder : index}
                        onChange={(value) =>
                          handleUpdateImage(index, 'sortOrder', typeof value === 'number' ? value : undefined)
                        }
                      />
                    </Col>
                    <Col span={2}>
                      <Radio checked={!!img.isPrimary} onChange={() => handleSetPrimaryImage(index)}>
                        主图
                      </Radio>
                    </Col>
                    <Col span={1}>
                      <Button theme='danger' variant='text' onClick={() => handleDeleteImage(index)}>
                        删除
                      </Button>
                    </Col>
                  </Row>
                ))
              )}
              <Button theme='primary' variant='outline' size='small' onClick={handleAddImage}>
                新增图片
              </Button>
            </div>
          </FormItem>
        </Form>
      </Dialog>
    </div>
  );
};

export default memo(StoneListPage);
